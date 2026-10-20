import { useState } from 'react';
import { useData } from '@/data/provider';
import { needsBackup } from '@/domain/backup-nudge';
import { isCareMode } from '@/domain/care';
import { addDays, toLocalDate } from '@/domain/dates';
import { forecastFor, forecastText, riskReminder, riskReminderLabel } from '@/domain/forecast';
import { buildDailyReminderIcs } from '@/domain/calendar';
import { download } from '@/ui/download';
import { DEFAULT_OATH, essentialRoutine, isHardDay, lastWeekCount, periodFor, routineDays, routineFor, type RoutineStep, type RoutineStyle } from '@/domain/routine';
import { useInstall } from '@/platform/install';
import { navigate } from '@/router';
import { Chevron, Icon } from '@/ui/icons';
import { TonightCard } from '../evening/TonightCard';
import { CareCard } from '../home/CareCard';
import { MorningCard } from '../home/MorningCard';
import { WeekChallengeCard } from '../home/WeekChallengeCard';
import { vibrate } from '../games/record';
import { StepIcon } from './StepIcon';
import { SkyScene } from '@/ui/illustrations';

const GREETING = {
  manha: 'Bom dia. Comece o dia no controle: poucos minutos fazem diferença.',
  tarde: 'Boa tarde. Se a vontade aparecer, a ajuda está a um toque.',
  noite: 'Boa noite. Hora de descarregar o dia, escrever e descansar.',
} as const;

/** Tela inicial: a rotina do dia em três tempos, com o período atual em destaque. */
export function Routine() {
  const { repos, write } = useData();
  const now = new Date();
  const today = toLocalDate(now);
  const current = periodFor(now, repos.settings.get('workEndTime', '18:00'));
  const done = new Set(repos.routine.doneOn(today));
  const active = repos.routine.activeDates();
  const care = isCareMode(repos.useEvents.lastOccurredAt(), now);
  const oath = repos.settings.get('oath', DEFAULT_OATH);
  const startDate = repos.settings.get('trackingStartDate', today);
  const lastBackup = repos.settings.get<string | null>('lastBackupAt', null);
  const backupDue = needsBackup(today, startDate, lastBackup ? toLocalDate(new Date(lastBackup)) : null, repos.settings.get<string | null>('backupSnoozeUntil', null));
  const chosenStyle = repos.settings.get<RoutineStyle | null>('routineStyle', null);
  const hard = isHardDay(repos.settings.get<string | null>('hardDay', null), today);
  const ROUTINE = hard ? essentialRoutine(routineFor(chosenStyle ?? 'magica')) : routineFor(chosenStyle ?? 'magica');
  const ALL_STEPS = ROUTINE.flatMap((p) => p.steps);
  const forecastInput = {
    today,
    journal: repos.journal.listBetween(addDays(today, -56), today),
    cravings: repos.cravings.listBetween(addDays(today, -56), today),
    useDates: repos.useEvents.useDatesBetween(addDays(today, -56), today),
  };
  const forecast = forecastFor(forecastInput);
  const reminder = forecast ? riskReminder(forecastInput) : null;
  const reminderKey = reminder && `${reminder.time} ${reminder.days.join(',')}`;
  const reminderSaved = reminderKey !== null && repos.settings.get<string | null>('riskReminder', null) === reminderKey;
  const addRiskReminder = () => {
    if (!reminder || !reminderKey) return;
    const url = window.location.href.split(/[?#]/)[0];
    const ics = buildDailyReminderIcs({ ...reminder, url, now: new Date(), title: 'Rotina: preparar a noite' });
    download('rotina-lembrete-risco.ics', ics, 'text/calendar');
    write((r) => r.settings.set('riskReminder', reminderKey));
  };
  // Uma "escolha que parece inocente" que a pessoa escreveu, trocando a cada dia.
  const signals = repos.plan.list('sinal_alerta');
  const signal = signals.length ? signals[Number(today.slice(8)) % signals.length] : null;
  const count = ALL_STEPS.filter((s) => done.has(s.id)).length;
  const days = routineDays(active);
  const [open, setOpen] = useState<Set<string>>(() => new Set([current]));
  const toggleOpen = (id: string) => setOpen((o) => new Set(o.has(id) ? [...o].filter((x) => x !== id) : [...o, id]));
  const periodNow = ROUTINE.find((p) => p.id === current)!;
  const next = periodNow.steps.find((s) => !done.has(s.id)) ?? ALL_STEPS.find((s) => !done.has(s.id));
  const pct = Math.round((count / ALL_STEPS.length) * 100);
  const { canInstall, install } = useInstall();
  const installHidden = repos.settings.get('installDismissed', false);
  const dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const openStep = (s: RoutineStep) => (s.link === 'diario' ? navigate('diario') : navigate('rotina', s.id));

  return (
    <main className="screen screen--tabs">
      <header className="hero hero--sky">
        <SkyScene period={current} />
        <div className="hero__brand">
          <div>
            <p className="eyebrow">{dateLabel}</p>
            <div className="hero__title">
              <img className="hero__illustration" src={`${import.meta.env.BASE_URL}icons/icon-192.png`} width="40" height="40" alt="" />
              <h1>Rotina Mágica</h1>
            </div>
            <p className="tagline">Retome o controle da sua vida, um dia de cada vez.</p>
          </div>
        </div>
      </header>

      <section className="today" aria-label="Progresso">
        <div className="ring" style={{ ['--pct' as string]: `${pct}%` }} role="img" aria-label={`${count} de ${ALL_STEPS.length} passos hoje`}>
          <strong>{count}</strong>
          <span>de {ALL_STEPS.length}</span>
        </div>
        <div className="today__text">
          <p>{hard ? 'Dia difícil. Hoje é só o básico, e isso já conta.' : GREETING[current]}</p>
          <p className="muted small">
            {lastWeekCount(active, today)} de 7 dias na semana · {days} {days === 1 ? 'dia' : 'dias'} de rotina no total
          </p>
        </div>
      </section>

      {hard ? (
        <section className="card hardday">
          <h2>Só o básico hoje</h2>
          <p className="small muted">Quatro passos curtos, uns 8 minutos. Amanhã a rotina volta inteira sozinha.</p>
          <button type="button" className="btn btn--ghost" onClick={() => write((r) => r.settings.set('hardDay', null))}>
            Voltar à rotina completa
          </button>
        </section>
      ) : (
        <button type="button" className="hardday__ask" onClick={() => write((r) => r.settings.set('hardDay', today))}>
          Dia pesado? <strong>Fazer só o básico hoje</strong>
        </button>
      )}

      <section className={`forecast forecast--${forecast?.level ?? 'aprendendo'}`} aria-label="Clima de hoje">
        <span className="forecast__dot" aria-hidden="true" />
        <div>
          <p className="eyebrow">
            Clima de hoje · {forecast ? { calmo: 'tranquilo', atencao: 'atenção', alto: 'cuidado redobrado' }[forecast.level] : 'aprendendo'}
          </p>
          {forecast ? (
            <>
              <p>{forecastText(forecast)}</p>
              {(forecast.peakHour !== null || forecast.topTrigger) && (
                <p className="muted small">
                  {forecast.peakHour !== null && `A vontade costuma apertar perto das ${forecast.peakHour}h: tenha algo marcado para essa hora. `}
                  {forecast.topTrigger && `Gatilho mais comum: ${forecast.topTrigger.toLowerCase()}.`}
                </p>
              )}
            </>
          ) : (
            <p className="muted small">Com alguns dias de diário, o app aprende quais dias e horários pedem mais cuidado. Tudo calculado aqui no celular.</p>
          )}
          {reminder &&
            (reminderSaved ? (
              <p className="muted small">Lembrete baixado para {riskReminderLabel(reminder)}. Abra o arquivo para salvar na agenda.</p>
            ) : (
              <button type="button" className="forecast__remind" onClick={addRiskReminder}>
                Avisar antes: {riskReminderLabel(reminder)}
              </button>
            ))}
          {signal && <p className="small forecast__signal">Fique de olho: {signal.text}</p>}
        </div>
      </section>

      {care && <CareCard onUnderstand={() => navigate('usei', 'entender')} />}
      <MorningCard />

      <button type="button" className="sos" onClick={() => navigate('sos')}>
        <span className="sos__main">
          <Icon id="aba_ajuda" />
          <span>Bateu vontade?</span>
        </span>
        <span>Ajuda agora · abrir em um toque</span>
      </button>

      {next && (
        <button type="button" className="next" onClick={() => openStep(next)}>
          <span className="eyebrow">Seu próximo passo · {next.minutes} min</span>
          <span className="next__row">
            <span className="item__icon">
              <StepIcon step={next} />
            </span>
            <span className="item__text">
              <strong>{next.title}</strong>
              <span className="muted small">{next.summary}</span>
            </span>
            <Chevron />
          </span>
        </button>
      )}
      {!next && <p className="card card--accent center">Rotina completa hoje. Isso é cuidar de você.</p>}

      {chosenStyle === null && (
        <section className="card card--accent">
          <h2>Como você quer a sua rotina?</h2>
          <p className="small muted">Os horários são os mesmos. Dá para trocar depois em Ajustes.</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => write((r) => r.settings.set('routineStyle', 'magica'))}>
              Com ritual
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => write((r) => r.settings.set('routineStyle', 'simples'))}>
              Sem ritual
            </button>
          </div>
        </section>
      )}

      <button type="button" className="oath" onClick={() => navigate('rotina', 'm_juramento')}>
        <span className="eyebrow">Meu compromisso</span>
        <span className="oath__text">{oath}</span>
      </button>

      {ROUTINE.map((p) => {
        const n = p.steps.filter((s) => done.has(s.id)).length;
        return (
          <section key={p.id} className={`period${p.id === current ? ' period--now' : ''}`} aria-label={p.title}>
            <button type="button" className="period__head" aria-expanded={open.has(p.id)} onClick={() => toggleOpen(p.id)}>
              <h2>
                {p.title} <span className="period__name">· {p.name}</span>
              </h2>
              <span className={`muted small${n === p.steps.length ? ' period__done' : ''}`}>
                {p.id === current ? 'agora · ' : ''}
                {n === p.steps.length ? 'completo ✓' : `${n}/${p.steps.length}`} {open.has(p.id) ? '▴' : '▾'}
              </span>
            </button>
            <span className="period__bar" aria-hidden="true">
              <span style={{ width: `${(n / p.steps.length) * 100}%` }} />
            </span>
            {open.has(p.id) && (
              <>
            <p className="muted small">{p.purpose}</p>
            <div className="list">
              {p.steps.map((s) => (
                <div key={s.id} className={`item${done.has(s.id) ? ' item--done' : ''}`}>
                  <button
                    type="button"
                    className="item__check"
                    aria-pressed={done.has(s.id)}
                    aria-label={`Marcar ${s.title}`}
                    onClick={() => (vibrate(done.has(s.id) ? 8 : 20), write((r) => r.routine.toggle(today, s.id)))}
                  >
                    {done.has(s.id) ? '✓' : ''}
                  </button>
                  <button type="button" className="item__body" onClick={() => openStep(s)}>
                    <span className="item__icon">
                      <StepIcon step={s} />
                    </span>
                    <span className="item__text">
                      <strong>{s.title}</strong>
                      <span className="muted small">
                        {s.summary} · {s.minutes} min
                      </span>
                    </span>
                    <Chevron />
                  </button>
                </div>
              ))}
            </div>
              </>
            )}
            {p.id === 'tarde' && !care && <TonightCard />}
          </section>
        );
      })}

      {!hard && <WeekChallengeCard />}

      {canInstall && !installHidden && (
        <section className="card install">
          <h2>Leve o app para a tela inicial</h2>
          <p className="small muted">Abre com um toque, funciona sem internet e o atalho de ajuda aparece ao segurar o ícone.</p>
          <div className="row">
            <button type="button" className="btn" onClick={install}>
              Instalar
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => write((r) => r.settings.set('installDismissed', true))}>
              Agora não
            </button>
          </div>
        </section>
      )}

      {backupDue && (
        <section className="card nudge">
          <h2>Guarde uma cópia</h2>
          <p className="small muted">Seu progresso só existe neste celular. Se o navegador for limpo, ele some. Um backup leva 10 segundos.</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => navigate('ajustes')}>
              Fazer backup
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => write((r) => r.settings.set('backupSnoozeUntil', addDays(today, 7)))}>
              Agora não
            </button>
          </div>
        </section>
      )}

      <section>
        <h2>Mais ferramentas</h2>
        <div className="tools">
          <button type="button" className="tool" onClick={() => navigate('pensamento')}>
            <span className="item__icon">
              <Icon id="ferr_pensamento" />
            </span>
            <strong>Desatar um pensamento</strong>
            <span className="muted small">Quando a cabeça insiste</span>
          </button>
          <button type="button" className="tool" onClick={() => navigate('jogos')}>
            <span className="item__icon">
              <Icon id="ferr_jogos" />
            </span>
            <strong>Jogos</strong>
            <span className="muted small">Cinco jogos curtos</span>
          </button>
          <button type="button" className="tool" onClick={() => navigate('treino')}>
            <span className="item__icon">
              <Icon id="ferr_vivencias" />
            </span>
            <strong>Terapias e vivências</strong>
            <span className="muted small">Exercícios das terapias que ajudam a parar</span>
          </button>
          <button type="button" className="tool" onClick={() => navigate('lab')}>
            <span className="item__icon">
              <Icon id="ferr_laboratorio" />
            </span>
            <strong>Seu laboratório</strong>
            <span className="muted small">O que funciona com você</span>
          </button>
        </div>
      </section>
    </main>
  );
}

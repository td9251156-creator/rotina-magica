import { Suspense, useState } from 'react';
import { useData } from '@/data/provider';
import { addDays, toLocalDate } from '@/domain/dates';
import { periodFor } from '@/domain/routine';
import { findTechnique, latestHarderTechniqueIds, techniqueOfTheDay, techniqueMinutes } from '@/domain/training';
import { GENERAL_TECHNIQUES } from '@/domain/wellbeing-techniques';
import type { Practice } from '@/data/repositories/types';
import { navigate } from '@/router';
import { Icon } from '@/ui/icons';
import { SkyScene } from '@/ui/illustrations';
import { Screen } from '@/ui/Screen';
import { saveWellbeingCheckin } from '@/domain/support';
import { careForMood, careWeek, isBedtime, MOODS } from '@/domain/wellbeing-home';
import './wellbeing.css';
import { lazyScreen } from '@/ui/lazy';

const TrainingSession = lazyScreen(() => import('../training/Training'), 'TrainingSession');

const QUICK_CARES = [
  { id: 'pausa_corpo', icon: 'passo_respirar' as const, title: 'Acalmar o corpo', detail: 'Uma pausa sem pressa' },
  { id: 'pensamento_distante', icon: 'ferr_pensamento' as const, title: 'Cabeça cheia', detail: 'Dar espaço aos pensamentos' },
  { id: 'pedir_apoio', icon: 'ter_apoio' as const, title: 'Buscar companhia', detail: 'Preparar um pedido de apoio' },
  { id: 'proximo_passo', icon: 'feito' as const, title: 'Uma coisa de cada vez', detail: 'Escolher só o próximo passo' },
  { id: 'acolher_momento', icon: 'ter_aceitacao' as const, title: 'Dia pesado', detail: 'Encontrar palavras menos duras' },
];

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEKDAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** Check-in de um toque: guarda o humor do dia e oferece um cuidado que combina com ele. */
function MoodCheckin({ today }: { today: string }) {
  const { repos, write } = useData();
  const saved = repos.checkins.getByDate(today);
  const mood = saved?.mood ?? null;
  const [answered, setAnswered] = useState(false);
  const care = mood !== null ? careForMood(mood) : null;
  const technique = care ? findTechnique(care.techniqueId) : undefined;
  const choose = (value: number) => {
    write((r) => saveWellbeingCheckin(r, today, { mood: value, stress: saved?.stress ?? null, note: saved?.note ?? null }));
    setAnswered(true);
  };
  return (
    <section className="wellbeing-welcome" aria-labelledby="como-esta">
      <h2 id="como-esta">Como está sendo para você?</h2>
      <p className="muted">Um toque basta. Fica só neste aparelho e ajuda a escolher um cuidado.</p>
      <div className="mood-picker" role="group" aria-label="Como está seu dia">
        {MOODS.map((label, i) => <button key={label} type="button" className={`mood-picker__option mood-picker__option--${i + 1}`} aria-pressed={mood === i + 1} onClick={() => choose(i + 1)}><span className="mood-picker__dot" aria-hidden="true" />{label}</button>)}
      </div>
      {care && technique && (
        <div className="card mood-care" role={answered ? 'status' : undefined}>
          <p>{care.message}</p>
          <button type="button" className="btn" onClick={() => navigate('treino', technique.id)}>{technique.title} · cerca de {techniqueMinutes(technique)} min</button>
          <button type="button" className="link" onClick={() => navigate('diario')}>Escrever mais no diário →</button>
        </div>
      )}
    </section>
  );
}

/** Os últimos sete dias com algum cuidado. Sem sequência: um dia vazio não apaga os outros. */
function CareWeek({ today }: { today: string }) {
  const { repos } = useData();
  const generalIds = new Set(GENERAL_TECHNIQUES.map((t) => t.id));
  const dates = [
    ...repos.practices.list().filter((p) => generalIds.has(p.techniqueId)).map((p) => p.date),
    ...repos.checkins.listBetween(addDays(today, -6), today).filter((c) => c.mood !== null || c.stress !== null || c.note).map((c) => c.date),
  ];
  const week = careWeek(today, dates);
  const count = week.filter((d) => d.cared).length;
  return (
    <section className="card care-week" aria-labelledby="sua-semana">
      <h2 id="sua-semana">Sua semana</h2>
      <ol className="care-week__days">
        {week.map((d) => {
          const day = new Date(`${d.date}T12:00:00`).getDay();
          return <li key={d.date} className={d.cared ? 'is-cared' : ''} aria-label={`${WEEKDAY_NAMES[day]}${d.date === today ? ' (hoje)' : ''}: ${d.cared ? 'teve cuidado' : 'sem registro'}`}><span aria-hidden="true">{WEEKDAYS[day]}</span></li>;
        })}
      </ol>
      <p className="small muted">{count === 0 ? 'Nenhum cuidado registrado nesta semana ainda. Tudo bem começar por um toque.' : `${count} ${count === 1 ? 'dia' : 'dias'} com algum cuidado nos últimos 7. Não há sequência para manter: cada dia conta por si.`}</p>
      <button type="button" className="link" onClick={() => navigate('lab')}>Ver meus cuidados ao longo do tempo →</button>
    </section>
  );
}

export function WellbeingHome() {
  const { repos } = useData();
  const today = toLocalDate(new Date());
  const generalIds = new Set(GENERAL_TECHNIQUES.map((t) => t.id));
  const entries = repos.practices.list().filter((p) => generalIds.has(p.techniqueId));
  const harder = new Set(latestHarderTechniqueIds(entries));
  const suggestion = techniqueOfTheDay(today, entries.map((p) => p.techniqueId), repos.settings.get('trackingStartDate', today), 'general', undefined, [...harder]);
  const quickCares = QUICK_CARES.filter((care) => !harder.has(care.id));
  const visibleCares = (quickCares.length >= 3 ? quickCares : QUICK_CARES).slice(0, 3);
  const personalPlan = repos.plan.list('plano_noite');
  const checkin = repos.checkins.getByDate(today);
  const period = periodFor(new Date(), repos.settings.get('workEndTime', '18:00'));
  return (
    <main className="screen screen--tabs wellbeing-home">
      <header className="hero hero--sky">
        <SkyScene period={period} />
        <div className="hero__brand"><div>
          <p className="eyebrow">Um cuidado de cada vez</p>
          <div className="hero__title"><img className="hero__illustration" src={`${import.meta.env.BASE_URL}icons/icon-192.png`} width="40" height="40" alt="" /><h1>Rotina Mágica</h1></div>
          <p className="tagline">Companhia e pequenos passos para atravessar dias difíceis.</p>
        </div></div>
      </header>
      <button type="button" className="btn wellbeing-help" onClick={() => navigate('sos')}><Icon id="aba_ajuda" />Preciso de uma pausa agora</button>
      <MoodCheckin today={today} />
      {/* Depois do check-in, o cuidado sugerido pelo humor substitui os atalhos. */}
      {checkin?.mood == null && <section className="wellbeing-quick" aria-label="Escolha um cuidado">
        {visibleCares.map((care) => <button key={care.id} type="button" onClick={() => navigate('treino', care.id)}><Icon id={care.icon} /><strong>{care.title}</strong><span>{care.detail}</span></button>)}
      </section>}
      {isBedtime(new Date()) ? (
        <button type="button" className="next wellbeing-suggestion" onClick={() => navigate('dormir')}>
          <span className="eyebrow">Um convite para esta noite · cerca de 5 min</span>
          <strong>Rotina para dormir</strong><span className="muted small">Preparar o quarto, soltar o corpo e deixar um som que some sozinho.</span>
        </button>
      ) : (
        <button type="button" className="next wellbeing-suggestion" onClick={() => navigate('treino', suggestion.id)}>
          <span className="eyebrow">Um convite para hoje · cerca de {techniqueMinutes(suggestion)} min</span>
          <strong>{suggestion.title}</strong><span className="muted small">{suggestion.why}</span>
        </button>
      )}
      {personalPlan[0]?.extra?.firstStep != null && <section className="card"><p className="eyebrow">Uma ideia sua para hoje</p><p>{String(personalPlan[0].extra.firstStep)}</p><p className="small muted">Se couber, experimente. Você pode adaptar ou deixar para outro dia.</p></section>}
      <button type="button" className="wellbeing-checkin" onClick={() => navigate('diario')}>
        <span className="item__icon"><Icon id="aba_diario" /></span>
        <span><strong>{checkin?.note || checkin?.stress != null || checkin?.mood != null ? 'Seu registro de hoje' : 'Um espaço para você'}</strong><span className="muted small">Anote como está, sem dar uma nota para o seu valor.</span></span><Icon id="seta" />
      </button>
      <CareWeek today={today} />
      <div className="tools">
        <button type="button" className="tool tool--wide" onClick={() => navigate('dormir')}><span className="item__icon"><Icon id="passo_fechar" /></span><strong>Rotina para dormir</strong><span className="muted small">Desacelerar antes de deitar</span></button>
        <button type="button" className="tool" onClick={() => navigate('treino')}><span className="item__icon"><Icon id="ferr_vivencias" /></span><strong>Vivências guiadas</strong><span className="muted small">Escolha pelo que precisa agora</span></button>
        <button type="button" className="tool" onClick={() => navigate('jogos')}><span className="item__icon"><Icon id="ferr_jogos" /></span><strong>Jogos para uma pausa</strong><span className="muted small">Mudar o foco, sem cobrança</span></button>
      </div>
      <p className="wellbeing-note">Recursos de autocuidado, sem diagnóstico. O app não substitui psicoterapia ou atendimento de saúde.</p>
    </main>
  );
}

export function WellbeingJournal() {
  const { repos, write } = useData();
  const today = toLocalDate(new Date());
  const saved = repos.checkins.getByDate(today);
  const [mood, setMood] = useState<number | null>(saved?.mood ?? null);
  const [stress, setStress] = useState<number | null>(saved?.stress ?? null);
  const [note, setNote] = useState(saved?.note ?? '');
  const [savedNow, setSavedNow] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const entries = repos.checkins.listBetween(addDays(today, -13), today);
  return (
    <Screen title="Seu diário" className="screen--tabs wellbeing-journal">
      <p className="muted">Um lugar para reconhecer o que você sente. O registro fica neste navegador; escreva apenas o que quiser guardar.</p>
      <fieldset className="wellbeing-fieldset"><legend>Como está seu dia?</legend><div className="chips">{MOODS.map((label, i) => <button key={label} type="button" className={`chip${mood === i + 1 ? ' chip--on' : ''}`} aria-pressed={mood === i + 1} onClick={() => (setMood(mood === i + 1 ? null : i + 1), setSavedNow(false))}>{label}</button>)}</div></fieldset>
      <fieldset className="wellbeing-fieldset"><legend>Quanto este momento está pesando? (0 a 10)</legend><p className="muted small">0: leve · 10: muito pesado. A nota é opcional.</p><div className="rating" role="group" aria-label="Peso do momento">{Array.from({ length: 11 }, (_, n) => <button key={n} type="button" className={stress === n ? 'on' : ''} aria-pressed={stress === n} onClick={() => (setStress(stress === n ? null : n), setSavedNow(false))}>{n}</button>)}</div></fieldset>
      <label className="field">O que você gostaria de registrar?<textarea rows={5} value={note} onChange={(e) => (setNote(e.target.value), setSavedNow(false))} placeholder="Pode ser sobre o que pesa, o que ajudou ou o que você precisa. Não há resposta certa." /></label>
      <button type="button" className="btn" disabled={mood === null && stress === null && !note.trim()} onClick={() => {
        write((r) => { saveWellbeingCheckin(r, today, { mood, stress, note: note.trim() || null }); r.routine.toggle(today, 'n_diario', true); });
        setSavedNow(true);
      }}>{saved ? 'Atualizar meu registro' : 'Guardar meu registro'}</button>
      {saved && <button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(true)}>Excluir registro de hoje</button>}
      {confirmDelete && <div className="card" role="alertdialog" aria-label="Excluir registro de hoje?"><h2>Excluir registro de hoje?</h2><p>O texto e as notas deste dia sairão do diário e do histórico.</p><div className="actions"><button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button><button type="button" className="btn" onClick={() => { write((r) => r.checkins.removeByDate(today)); setMood(null); setStress(null); setNote(''); setSavedNow(false); setConfirmDelete(false); }}>Excluir</button></div></div>}
      {savedNow && <p className="card" role="status">Guardado neste aparelho. Obrigado por reservar esse espaço para você.</p>}
      <section className="card"><h2>Seus últimos 14 dias</h2><p className="small muted">A altura indica o peso que você registrou. Dias vazios significam “sem registro”, não um dia melhor ou pior.</p><div className="wellbeing-history" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => {
        const day = addDays(today, i - 13); const entry = entries.find((e) => e.date === day);
        return <span key={day} title={`${day}: ${entry?.stress ?? 'sem registro'}`} className={entry?.stress == null ? 'is-empty' : ''} style={{ height: `${entry?.stress == null ? 4 : 8 + entry.stress * 9}%` }} />;
      })}</div><details><summary>Ver registros por dia</summary><ul aria-label="Registros dos últimos 14 dias">{Array.from({ length: 14 }, (_, i) => { const day = addDays(today, i - 13); const entry = entries.find((e) => e.date === day); return <li key={day}>{day.split('-').reverse().join('/')}: {entry?.stress == null ? 'sem registro' : `peso ${entry.stress} de 10`}</li>; })}</ul></details></section>
    </Screen>
  );
}

export function WellbeingProgress({ onBack }: { onBack: () => void }) {
  const { repos } = useData();
  const generalIds = new Set(GENERAL_TECHNIQUES.map((t) => t.id));
  const practices = repos.practices.list().filter((p) => generalIds.has(p.techniqueId));
  const days = new Set(practices.map((p) => p.date)).size;
  const records = repos.checkins.listBetween('2000-01-01', toLocalDate(new Date())).filter((c) => c.stress !== null || c.mood !== null || c.note);
  const latestFeedback = new Map<string, Practice['feedback']>();
  practices.forEach((practice) => { if (practice.feedback) latestFeedback.set(practice.techniqueId, practice.feedback); });
  const helpfulIds = [...latestFeedback].filter(([, feedback]) => feedback === 'helped').map(([id]) => id);
  return <Screen title="Seus cuidados" onBack={onBack}><p className="muted">Isto é uma memória do que você fez e de como cada vivência pareceu para você. Não é uma medida de saúde ou uma competição.</p><div className="wellbeing-stats"><section className="card"><strong>{practices.length}</strong><span>vivências praticadas</span></section><section className="card"><strong>{days}</strong><span>dias com algum cuidado</span></section><section className="card"><strong>{records.length}</strong><span>registros no diário</span></section></div>{helpfulIds.length > 0 && <section className="card"><h2>Você marcou que estas ajudaram</h2><p className="small muted">É a sua percepção; pode mudar de um dia para outro.</p><div className="stack">{helpfulIds.map((id) => { const technique = findTechnique(id); return technique && <button key={id} className="wellbeing-action" onClick={() => navigate('treino', id)}><span><strong>{technique.title}</strong><span>Fazer de novo, se quiser</span></span><Icon id="seta" /></button>; })}</div></section>}<section className="card"><h2>O cuidado pode mudar</h2><p>Uma prática pode ajudar num dia e não em outro. Você pode contar como foi ao concluir uma vivência; essa resposta fica neste aparelho.</p><button type="button" className="btn" onClick={() => navigate('treino')}>Escolher uma vivência</button></section></Screen>;
}

export function WellbeingSupport({ locked, onReturnToLock }: { locked: boolean; onReturnToLock?: () => void }) {
  const { repos } = useData();
  const [exercise, setExercise] = useState<string | null>(null);
  const [returned, setReturned] = useState(false);
  const phrase = !locked ? (repos.settings.get<string>('letter', '').trim() || repos.plan.list('gentileza').at(-1)?.text) : null;
  // A tela bloqueada não consulta o histórico para não revelar preferências por ausência ou ordem.
  const harder = new Set(locked ? [] : latestHarderTechniqueIds(repos.practices.list()));
  const actions = [
    { id: 'ancorar_sentidos', icon: 'ter_atencao' as const, title: 'Voltar para o aqui e agora', detail: 'Olhar ao redor e notar o ambiente · cerca de 2 min' },
    { id: 'pausa_corpo', icon: 'passo_respirar' as const, title: 'Dar uma pausa ao corpo', detail: 'Respiração no seu ritmo, sem forçar · cerca de 2 min' },
    { id: 'pensamento_distante', icon: 'ferr_pensamento' as const, title: 'Dar espaço ao que passa na cabeça', detail: 'Uma opção sem foco na respiração · cerca de 2 min' },
    { id: 'pedir_apoio', icon: 'ter_apoio' as const, title: 'Preparar um pedido de companhia', detail: 'Encontrar palavras para chamar alguém · cerca de 2 min' },
  ];
  const saferActions = actions.filter((action) => !harder.has(action.id));
  const visibleActions = (saferActions.length >= 3 ? saferActions : actions).slice(0, 3);
  if (exercise) return <Suspense fallback={<main className="screen" role="status">Abrindo…</main>}><TrainingSession key={exercise} id={exercise} onBack={() => setExercise(null)} onDone={() => { setExercise(null); setReturned(true); }} onMore={() => setExercise(null)} finishLabel="Voltar à ajuda" /></Suspense>;
  return <main className="screen screen--tabs wellbeing-support">
    <span className="wellbeing-support__icon"><Icon id="aba_ajuda" /></span>
      <p className="eyebrow">Pausa agora</p><h1>Vamos cuidar deste momento.</h1>
    <p className="muted">Não precisa explicar tudo nem resolver o dia inteiro. Comece pelo que parece possível.</p>
    {returned && <p className="card" role="status">Você reservou um momento para si. Se ainda estiver difícil, pode tentar outro cuidado ou buscar companhia.</p>}
    {phrase && <blockquote className="card"><p className="eyebrow">Uma frase sua para reler</p><p>{phrase}</p></blockquote>}
    <div className="stack">
      {visibleActions.map((action) => <button key={action.id} type="button" className="wellbeing-action" onClick={() => setExercise(action.id)}><Icon id={action.icon} /><span><strong>{action.title}</strong><span>{action.detail}</span></span><Icon id="seta" /></button>)}
    </div>
    {locked && onReturnToLock && <button type="button" className="btn btn--ghost" onClick={onReturnToLock}>Voltar para entrar com PIN</button>}
    {!locked && <button type="button" className="link" onClick={() => navigate('treino')}>Ver outras vivências →</button>}
    <p className="wellbeing-note">Você pode parar qualquer exercício se ele não estiver confortável. Este espaço oferece pausas de autocuidado.</p>
  </main>;
}

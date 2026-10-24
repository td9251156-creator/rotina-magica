import { Suspense, useState, type CSSProperties } from 'react';
import { useData } from '@/data/provider';
import { addDays, toLocalDate } from '@/domain/dates';
import { findTechnique, latestHarderTechniqueIds, techniqueMinutes } from '@/domain/training';
import { GENERAL_TECHNIQUES } from '@/domain/wellbeing-techniques';
import type { Practice } from '@/data/repositories/types';
import { navigate } from '@/router';
import { Icon } from '@/ui/icons';
import { Screen } from '@/ui/Screen';
import { saveWellbeingCheckin } from '@/domain/support';
import { careForMood, careWeek, isBedtime, MOODS } from '@/domain/wellbeing-home';
import './wellbeing.css';
import { lazyScreen } from '@/ui/lazy';

const TrainingSession = lazyScreen(() => import('../training/Training'), 'TrainingSession');

const CARE_FALLBACKS = ['acolher_momento', 'ancorar_sentidos', 'proximo_passo', 'pensamento_distante'];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEKDAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** O humor como o sol nascendo no horizonte: cada resposta é só uma hora do dia, nunca uma nota. */
export function MoodList({ value, onChoose, label }: { value: number | null; onChoose: (mood: number) => void; label: string }) {
  return (
    <div className="mood-list" role="group" aria-label={label}>
      {MOODS.map((text, i) => <button key={text} type="button" aria-pressed={value === i + 1} onClick={() => onChoose(i + 1)}><span className="sun" style={{ '--i': i } as CSSProperties} aria-hidden="true" />{text}</button>)}
    </div>
  );
}

function greeting(now: Date) {
  const h = now.getHours();
  return h < 5 ? 'Boa noite.' : h < 12 ? 'Bom dia.' : h < 18 ? 'Boa tarde.' : 'Boa noite.';
}

/** Check-in de um toque: guarda o humor do dia e oferece um cuidado que combina com ele. */
function MoodCheckin({ today }: { today: string }) {
  const { repos, write } = useData();
  const saved = repos.checkins.getByDate(today);
  const mood = saved?.mood ?? null;
  const [answered, setAnswered] = useState(false);
  const care = mood !== null ? careForMood(mood) : null;
  // Uma vivência marcada como "ficou mais difícil" não volta como sugestão; entra outra parecida.
  const harder = new Set(latestHarderTechniqueIds(repos.practices.list()));
  const careId = care?.techniqueId && harder.has(care.techniqueId) ? CARE_FALLBACKS.find((id) => !harder.has(id)) : care?.techniqueId;
  const technique = careId ? findTechnique(careId) : undefined;
  const choose = (value: number) => {
    write((r) => saveWellbeingCheckin(r, today, { mood: value, stress: saved?.stress ?? null, note: saved?.note ?? null }));
    setAnswered(true);
  };
  return (
    <>
      <section className="wellbeing-welcome" aria-labelledby="como-esta">
        <p className="wellbeing-greeting">{greeting(new Date())}</p>
        <h1 id="como-esta">Como está sendo para você?</h1>
        <p className="muted">Um toque basta. Fica só neste aparelho.</p>
      </section>
      <MoodList value={mood} onChoose={choose} label="Como está seu dia" />
      {care && (
        <div className="card mood-care" role={answered ? 'status' : undefined}>
          <p className="mood-care__message">{care.message}</p>
          {technique
            ? <button type="button" className="btn" onClick={() => navigate('treino', technique.id)}>{technique.title} · {techniqueMinutes(technique)} min</button>
            : <button type="button" className="btn" onClick={() => navigate('diario')}>Escrever no diário</button>}
          {technique && <button type="button" className="link center" onClick={() => navigate('diario')}>Escrever mais no diário →</button>}
        </div>
      )}
    </>
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
      <header className="care-week__head"><h2 id="sua-semana">Sua semana</h2><span className="small muted">{count} {count === 1 ? 'dia' : 'dias'} com cuidado</span></header>
      <ol className="care-week__days">
        {week.map((d) => {
          const day = new Date(`${d.date}T12:00:00`).getDay();
          const isToday = d.date === today;
          return <li key={d.date} className={`${d.cared ? 'is-cared' : ''}${isToday ? ' is-today' : ''}`} aria-label={`${WEEKDAY_NAMES[day]}${isToday ? ' (hoje)' : ''}: ${d.cared ? 'teve cuidado' : 'sem registro'}`}><span className="sun" aria-hidden="true" /><span aria-hidden="true">{WEEKDAYS[day]}</span></li>;
        })}
      </ol>
      <p className="small muted">{count === 0 ? 'Nenhum cuidado registrado nesta semana ainda. Tudo bem começar por um toque.' : 'Não há sequência para manter: cada dia conta por si.'}</p>
      <button type="button" className="link" onClick={() => navigate('lab')}>Ver meus cuidados ao longo do tempo →</button>
    </section>
  );
}

export function WellbeingHome() {
  const { repos } = useData();
  const today = toLocalDate(new Date());
  const personalPlan = repos.plan.list('plano_noite');
  const night = isBedtime(new Date());
  const sleep = <button key="dormir" type="button" className="also__card" onClick={() => navigate('dormir')}><Icon id="passo_fechar" /><strong>Preparar para dormir</strong><span>{night ? 'Um convite para esta noite' : 'Soltar o corpo antes de deitar'}</span></button>;
  const guided = <button key="treino" type="button" className="also__card" onClick={() => navigate('treino')}><Icon id="ferr_vivencias" /><strong>Vivências guiadas</strong><span>Escolha pelo que precisa agora</span></button>;
  return (
    <main className="screen screen--tabs wellbeing-home">
      <p className="wellbeing-brand"><img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} width="30" height="30" alt="" />Rotina Mágica</p>
      <MoodCheckin today={today} />
      {personalPlan[0]?.extra?.firstStep != null && <section className="card"><p className="eyebrow">Uma ideia sua para hoje</p><p>{String(personalPlan[0].extra.firstStep)}</p><p className="small muted">Se couber, experimente. Você pode adaptar ou deixar para outro dia.</p></section>}
      <section className="also" aria-labelledby="tambem-por-aqui">
        <h2 id="tambem-por-aqui" className="section-label">Também por aqui</h2>
        <div className="also__grid">{night ? [sleep, guided] : [guided, sleep]}</div>
        <button type="button" className="also__row" onClick={() => navigate('jogos')}><Icon id="ferr_jogos" /><span><strong>Jogos para uma pausa</strong><span>Mudar o foco, sem cobrança</span></span><Icon id="seta" /></button>
      </section>
      <CareWeek today={today} />
      <p className="wellbeing-note">Recursos de autocuidado, sem diagnóstico. O app não substitui psicoterapia ou atendimento de saúde.</p>
    </main>
  );
}

const DATE_LABEL = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });

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
    <main className="screen screen--tabs wellbeing-journal">
      <p className="wellbeing-greeting">Hoje, {DATE_LABEL.format(new Date(`${today}T12:00:00`))}</p>
      <h1>Seu diário</h1>
      <p className="muted">Um lugar para reconhecer o que você sente. O registro fica neste navegador; escreva apenas o que quiser guardar.</p>
      <section className="journal-block" aria-labelledby="diario-humor"><h2 id="diario-humor">Como está seu dia?</h2><MoodList value={mood} onChoose={(m) => (setMood(mood === m ? null : m), setSavedNow(false))} label="Como está seu dia?" /></section>
      <section className="journal-block" aria-labelledby="diario-peso">
        <h2 id="diario-peso">Quanto este momento está pesando?</h2>
        <div className="stress-bars" role="group" aria-label="Peso do momento, de 0 a 10">{Array.from({ length: 11 }, (_, n) => <button key={n} type="button" className={stress === n ? 'on' : stress !== null && n < stress ? 'below' : ''} aria-pressed={stress === n} aria-label={String(n)} onClick={() => (setStress(stress === n ? null : n), setSavedNow(false))}><span className="stress-bars__bar" style={{ height: `${8 + n * 3.6}px` }} aria-hidden="true" /><span aria-hidden="true">{n}</span></button>)}</div>
        <p className="stress-bars__legend small muted"><span>0 · leve</span><span>opcional</span><span>10 · muito pesado</span></p>
      </section>
      <label className="field journal-block"><span className="journal-block__label">O que você gostaria de registrar?</span><textarea rows={5} value={note} onChange={(e) => (setNote(e.target.value), setSavedNow(false))} placeholder="Pode ser sobre o que pesa, o que ajudou ou o que você precisa. Não há resposta certa." /></label>
      <button type="button" className="btn" disabled={mood === null && stress === null && !note.trim()} onClick={() => {
        write((r) => { saveWellbeingCheckin(r, today, { mood, stress, note: note.trim() || null }); r.routine.toggle(today, 'n_diario', true); });
        setSavedNow(true);
      }}>{saved ? 'Atualizar meu registro' : 'Guardar meu registro'}</button>
      {saved && <button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(true)}>Excluir registro de hoje</button>}
      {confirmDelete && <div className="card" role="alertdialog" aria-label="Excluir registro de hoje?"><h2>Excluir registro de hoje?</h2><p>O texto e as notas deste dia sairão do diário e do histórico.</p><div className="actions"><button type="button" className="btn btn--ghost" onClick={() => setConfirmDelete(false)}>Cancelar</button><button type="button" className="btn" onClick={() => { write((r) => r.checkins.removeByDate(today)); setMood(null); setStress(null); setNote(''); setSavedNow(false); setConfirmDelete(false); }}>Excluir</button></div></div>}
      {savedNow && <p className="card" role="status">Guardado neste aparelho. Obrigado por reservar esse espaço para você.</p>}
      <section className="card"><header className="care-week__head"><h2>Seus últimos 14 dias</h2><span className="small muted">peso registrado</span></header><div className="wellbeing-history" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => {
        const day = addDays(today, i - 13); const entry = entries.find((e) => e.date === day);
        return <span key={day} title={`${day}: ${entry?.stress ?? 'sem registro'}`} className={`${entry?.stress == null ? 'is-empty' : ''}${day === today ? ' is-today' : ''}`} style={{ height: `${entry?.stress == null ? 4 : 10 + entry.stress * 6}px` }} />;
      })}</div><p className="small muted">Dias vazios significam “sem registro”, não um dia melhor ou pior.</p><details><summary>Ver registros por dia</summary><ul aria-label="Registros dos últimos 14 dias">{Array.from({ length: 14 }, (_, i) => { const day = addDays(today, i - 13); const entry = entries.find((e) => e.date === day); return <li key={day}>{day.split('-').reverse().join('/')}: {entry?.stress == null ? 'sem registro' : `peso ${entry.stress} de 10`}</li>; })}</ul></details></section>
    </main>
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

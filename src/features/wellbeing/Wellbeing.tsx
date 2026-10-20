import { useState } from 'react';
import { useData } from '@/data/provider';
import { addDays, toLocalDate } from '@/domain/dates';
import { periodFor } from '@/domain/routine';
import { techniqueOfTheDay, techniqueMinutes } from '@/domain/training';
import { navigate } from '@/router';
import { Icon } from '@/ui/icons';
import { SkyScene } from '@/ui/illustrations';
import { Screen } from '@/ui/Screen';
import { saveWellbeingCheckin } from '@/domain/support';
import { TrainingSession } from '../training/Training';
import './wellbeing.css';

const MOODS = ['Muito pesado', 'Pesado', 'Mais ou menos', 'Um pouco melhor', 'Bem'];

export function WellbeingHome() {
  const { repos } = useData();
  const today = toLocalDate(new Date());
  const entries = repos.practices.list();
  const suggestion = techniqueOfTheDay(today, entries.map((p) => p.techniqueId), repos.settings.get('trackingStartDate', today), 'general');
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
      <section className="wellbeing-welcome">
        <h2>Como está sendo para você?</h2>
        <p className="muted">Você não precisa resolver tudo agora. Escolha um cuidado que caiba neste momento.</p>
      </section>
      <button type="button" className="btn wellbeing-help" onClick={() => navigate('sos')}><Icon id="aba_ajuda" />Preciso de apoio agora</button>
      <section className="wellbeing-quick" aria-label="Escolha um cuidado">
        <button type="button" onClick={() => navigate('treino', 'pausa_corpo')}><Icon id="passo_respirar" /><strong>Acalmar o corpo</strong><span>Uma pausa sem pressa</span></button>
        <button type="button" onClick={() => navigate('treino', 'pensamento_distante')}><Icon id="ferr_pensamento" /><strong>Cabeça cheia</strong><span>Dar espaço aos pensamentos</span></button>
        <button type="button" onClick={() => navigate('treino', 'pedir_apoio')}><Icon id="ter_apoio" /><strong>Buscar companhia</strong><span>Preparar um pedido de apoio</span></button>
      </section>
      <button type="button" className="next wellbeing-suggestion" onClick={() => navigate('treino', suggestion.id)}>
        <span className="eyebrow">Um convite para hoje · cerca de {techniqueMinutes(suggestion)} min</span>
        <strong>{suggestion.title}</strong><span className="muted small">{suggestion.why}</span>
      </button>
      <button type="button" className="wellbeing-checkin" onClick={() => navigate('diario')}>
        <span className="item__icon"><Icon id="aba_diario" /></span>
        <span><strong>{checkin?.note || checkin?.stress != null || checkin?.mood != null ? 'Seu registro de hoje' : 'Um espaço para você'}</strong><span className="muted small">Anote como está, sem dar uma nota para o seu valor.</span></span><Icon id="seta" />
      </button>
      <section className="card">
        <h2>No seu tempo</h2><p className="small muted">Não há obrigação de manter uma sequência nem de estar melhor ao terminar. Descansar e pedir ajuda também contam.</p>
        <button type="button" className="link" onClick={() => navigate('lab')}>Ver meus cuidados ao longo do tempo →</button>
      </section>
      <div className="tools">
        <button type="button" className="tool" onClick={() => navigate('treino')}><span className="item__icon"><Icon id="ferr_vivencias" /></span><strong>Vivências e terapias</strong><span className="muted small">Escolha pelo que precisa agora</span></button>
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
  const entries = repos.checkins.listBetween(addDays(today, -13), today);
  return (
    <Screen title="Seu diário" className="screen--tabs wellbeing-journal">
      <p className="muted">Um lugar para reconhecer o que você sente. Só você vê; escreva apenas o que quiser guardar.</p>
      <fieldset className="wellbeing-fieldset"><legend>Como está seu dia?</legend><div className="chips">{MOODS.map((label, i) => <button key={label} type="button" className={`chip${mood === i + 1 ? ' chip--on' : ''}`} aria-pressed={mood === i + 1} onClick={() => setMood(mood === i + 1 ? null : i + 1)}>{label}</button>)}</div></fieldset>
      <fieldset className="wellbeing-fieldset"><legend>Quanto este momento está pesando? (0 a 10)</legend><p className="muted small">0: leve · 10: muito pesado. A nota é opcional.</p><div className="rating" role="group" aria-label="Peso do momento">{Array.from({ length: 11 }, (_, n) => <button key={n} type="button" className={stress === n ? 'on' : ''} aria-pressed={stress === n} onClick={() => setStress(stress === n ? null : n)}>{n}</button>)}</div></fieldset>
      <label className="field">O que você gostaria de registrar?<textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pode ser sobre o que pesa, o que ajudou ou o que você precisa. Não há resposta certa." /></label>
      <button type="button" className="btn" disabled={mood === null && stress === null && !note.trim()} onClick={() => {
        write((r) => { saveWellbeingCheckin(r, today, { mood, stress, note: note.trim() || null }); r.routine.toggle(today, 'n_diario', true); });
        setSavedNow(true);
      }}>{saved ? 'Atualizar meu registro' : 'Guardar meu registro'}</button>
      {savedNow && <p className="card" role="status">Guardado neste aparelho. Obrigado por reservar esse espaço para você.</p>}
      <section className="card"><h2>Seus últimos 14 dias</h2><p className="small muted">A altura indica o peso que você registrou. Dias vazios significam “sem registro”, não um dia melhor ou pior.</p><div className="wellbeing-history" aria-label="Peso registrado nos últimos 14 dias">{Array.from({ length: 14 }, (_, i) => {
        const day = addDays(today, i - 13); const entry = entries.find((e) => e.date === day);
        return <span key={day} title={`${day}: ${entry?.stress ?? 'sem registro'}`} className={entry?.stress == null ? 'is-empty' : ''} style={{ height: `${entry?.stress == null ? 4 : 8 + entry.stress * 9}%` }} />;
      })}</div></section>
    </Screen>
  );
}

export function WellbeingProgress({ onBack }: { onBack: () => void }) {
  const { repos } = useData();
  const practices = repos.practices.list();
  const days = new Set(practices.map((p) => p.date)).size;
  const records = repos.checkins.listBetween('2000-01-01', toLocalDate(new Date())).filter((c) => c.stress !== null || c.mood !== null || c.note);
  return <Screen title="Seus cuidados" onBack={onBack}><p className="muted">Isto é uma memória dos cuidados que você fez, não uma medida de saúde ou uma competição.</p><div className="wellbeing-stats"><section className="card"><strong>{practices.length}</strong><span>vivências praticadas</span></section><section className="card"><strong>{days}</strong><span>dias com algum cuidado</span></section><section className="card"><strong>{records.length}</strong><span>registros no diário</span></section></div><section className="card"><h2>O cuidado pode mudar</h2><p>Uma prática pode ajudar num dia e não em outro. Seus números não precisam subir para que você mereça apoio.</p><button type="button" className="btn" onClick={() => navigate('treino')}>Escolher uma vivência</button></section></Screen>;
}

export function WellbeingSupport({ locked }: { locked: boolean }) {
  const { repos } = useData();
  const [exercise, setExercise] = useState<string | null>(null);
  const [returned, setReturned] = useState(false);
  const phrase = !locked ? repos.plan.list('gentileza').at(-1)?.text : null;
  if (exercise) return <TrainingSession key={exercise} id={exercise} onBack={() => setExercise(null)} onDone={() => { setExercise(null); setReturned(true); }} onMore={() => setExercise(null)} finishLabel="Voltar à ajuda" />;
  return <main className="screen screen--tabs wellbeing-support">
    <span className="wellbeing-support__icon"><Icon id="aba_ajuda" /></span>
    <p className="eyebrow">Ajuda agora</p><h1>Vamos cuidar deste momento.</h1>
    <p className="muted">Não precisa explicar tudo nem resolver o dia inteiro. Comece pelo que parece possível.</p>
    {returned && <p className="card" role="status">Você reservou um momento para si. Se ainda estiver difícil, pode tentar outro cuidado ou buscar companhia.</p>}
    {phrase && <blockquote className="card"><p className="eyebrow">Uma frase sua para reler</p><p>{phrase}</p></blockquote>}
    <div className="stack">
      <button type="button" className="wellbeing-action" onClick={() => setExercise('ancorar_sentidos')}><Icon id="ter_atencao" /><span><strong>Voltar para o aqui e agora</strong><span>Olhar ao redor e sentir o apoio do corpo · cerca de 2 min</span></span><Icon id="seta" /></button>
      <button type="button" className="wellbeing-action" onClick={() => setExercise('pausa_corpo')}><Icon id="passo_respirar" /><span><strong>Dar uma pausa ao corpo</strong><span>Respiração no seu ritmo, sem forçar · cerca de 2 min</span></span><Icon id="seta" /></button>
    </div>
    <section className="card"><h2>Falar com alguém</h2><p className="small muted">Se puder, procure alguém que respeite você. Também há apoio profissional e serviços gratuitos.</p><a className="btn" href="tel:188">CVV · conversar pelo 188</a><a className="link" href="https://cvv.org.br/" target="_blank" rel="noopener noreferrer">Conversar pelo chat do CVV →</a><a className="link" href="https://www.google.com/maps/search/UBS+CAPS" target="_blank" rel="noopener noreferrer">Buscar UBS ou CAPS perto de você →</a></section>
    <details className="wellbeing-emergency"><summary>Preciso de ajuda urgente</summary><p>Se houver risco imediato à sua segurança ou uma emergência de saúde, ligue para o SAMU ou procure uma emergência.</p><a className="btn" href="tel:192">SAMU · 192</a></details>
    {!locked && <button type="button" className="link" onClick={() => navigate('treino')}>Ver outras vivências →</button>}
    <p className="wellbeing-note">Você pode parar qualquer exercício se ele não estiver confortável. O app é um apoio de autocuidado, não um atendimento de emergência.</p>
  </main>;
}

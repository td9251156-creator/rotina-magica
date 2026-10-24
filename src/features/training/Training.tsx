import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { PlanItemKind } from '@/data/repositories/types';
import { useData } from '@/data/provider';
import { toLocalDate } from '@/domain/dates';
import { PRACTICES, practiceSeconds, type PracticeId, type RoutineStyle } from '@/domain/routine';
import { approachesFor, approachOf, techniqueIds, type TherapyItem, type Approach } from '@/domain/therapies';
import { findTechnique, latestHarderTechniqueIds, techniqueOfTheDay, techniqueMinutes, TECHNIQUES, type Technique } from '@/domain/training';
import { supportFocus, saveWellbeingCheckin } from '@/domain/support';
import { navigate } from '@/router';
import { Chip } from '@/ui/Chip';
import type { IconId } from '@/ui/app-icons';
import { Chevron, Icon } from '@/ui/icons';
import { Screen } from '@/ui/Screen';
import { Setting } from '@/ui/Setting';
import { PracticePlayer } from '../routine/PracticePlayer';
import { canSpeak, speak, stopSpeaking } from '@/platform/voice';
import { playNarration, stopNarratedAudio } from '@/platform/narrated-audio';
import { trainingFile } from '@/domain/narration';
import { PathArt } from '@/ui/illustrations';
import './training.css';

const APPROACH_ICONS: Record<string, IconId> = {
  motivacao: 'ter_motivacao', recaida: 'ter_recaida', atencao: 'ter_atencao', vontade: 'ter_atencao',
  aceitacao: 'ter_aceitacao', apoio: 'ter_apoio', familia: 'sos_falar',
  presenca: 'passo_respirar', acolhimento: 'aba_ajuda', clareza: 'ferr_pensamento', conexao: 'ter_apoio',
};
const NEEDS = [
  ['all', 'Todas as vivências'], ['presenca', 'Corpo tenso'], ['acolhimento', 'Dia pesado'],
  ['clareza', 'Cabeça cheia'], ['conexao', 'Preciso de apoio'],
] as const;

export function TrainingList({ onOpen, onBack }: { onOpen: (id: string) => void; onBack?: () => void }) {
  const { repos, write } = useData();
  const [playing, setPlaying] = useState<PracticeId | null>(null);
  const [need, setNeed] = useState('all');
  const focus = supportFocus(repos);
  const general = focus === 'general';
  const today = toLocalDate(new Date());
  const practices = repos.practices.list();
  const times = (id: string) => practices.filter((p) => p.techniqueId === id).length;
  const selectedApproach = general && need !== 'all' ? approachesFor(focus).find((a) => a.id === need) : undefined;
  const ofTheDay = techniqueOfTheDay(today, practices.map((p) => p.techniqueId), repos.settings.get('trackingStartDate', today), focus, selectedApproach ? techniqueIds(selectedApproach) : undefined, latestHarderTechniqueIds(practices));
  const style = repos.settings.get<RoutineStyle | null>('routineStyle', null);

  if (playing) {
    const stop = () => setPlaying(null);
    return <main className="screen"><PracticePlayer practice={PRACTICES[playing]} onStop={stop} onDone={() => { write((r) => r.practices.add(playing, today)); stop(); }} /></main>;
  }
  const open = (item: TherapyItem) => {
    if (item.kind === 'tecnica') onOpen(item.id);
    else if (item.kind === 'pratica') setPlaying(item.id);
    else navigate(item.route, item.param);
  };
  const describe = (item: TherapyItem) => {
    if (item.kind === 'atalho') return { title: item.title, why: item.why, status: 'Abrir ferramenta', duration: '', today: false };
    if (item.kind === 'pratica') {
      const p = PRACTICES[item.id];
      return { title: p.title, why: p.summary, status: 'Prática guiada', duration: `${Math.round(practiceSeconds(p) / 60)} min`, today: false };
    }
    const t = findTechnique(item.id);
    const practicedToday = practices.some((p) => p.techniqueId === item.id && p.date === today);
    return { title: t?.title ?? item.id, why: t?.why ?? '', status: practicedToday ? 'Feita hoje · pode repetir' : times(item.id) ? `Feita ${times(item.id)}×` : '', duration: t ? `${techniqueMinutes(t)} min · ${t.steps.length} passos` : '', today: practicedToday };
  };
  const items = (a: Approach) => <ul className="training-items">{a.items.map((item) => {
    const d = describe(item);
    return <li key={d.title}><button type="button" className="training-item" onClick={() => open(item)}><span className="item__text"><strong>{d.title}</strong><span className="muted small">{d.why}</span>{(d.duration || d.status) && <span className="training-meta">{d.duration && <span>{d.duration}</span>}{d.status && <span className={d.today ? 'training-badge' : 'therapy__status'}>{d.status}</span>}</span>}</span><Chevron /></button></li>;
  })}</ul>;
  if (!general) return (
    <Screen title="Terapias e vivências" onBack={onBack} className="screen--tabs training-list">
      <div className="training-landscape"><PathArt /></div>
      <p className="muted">Exercícios curtos para preparar seu kit de apoio. Escolha um cuidado possível; você pode repetir ou parar quando quiser.</p>
      <button type="button" className="next training-today--recovery" onClick={() => onOpen(ofTheDay.id)}><span className="eyebrow">Um convite para hoje · cerca de {techniqueMinutes(ofTheDay)} min</span><span className="next__row"><span className="item__icon"><Icon id={APPROACH_ICONS[approachOf(ofTheDay.id)?.id ?? 'recaida']} /></span><span className="item__text"><strong>{ofTheDay.title}</strong><span className="muted small">{ofTheDay.why}</span></span><Chevron /></span></button>
      {approachesFor(focus).map((a) => {
        const ids = techniqueIds(a);
        const done = ids.filter((id) => times(id) > 0).length;
        return <Setting key={a.id} title={a.title} hint={ids.length ? `${a.name} · ${done} de ${ids.length} ${ids.length === 1 ? 'feito' : 'feitos'}` : a.name} icon={<Icon id={APPROACH_ICONS[a.id]} />}><p className="small">{a.what}</p><p className="small muted evidence">Base: {a.evidence}</p>{items(a)}</Setting>;
      })}
      {style === 'magica' && <section className="card card--kit"><h2>E a sua prática espiritual?</h2><p className="small">Se fizer sentido para você, ela pode fazer parte do seu cuidado. É opcional e não substitui acompanhamento profissional.</p><p className="small muted">Num dia difícil, faça só o básico, sem cobrança.</p></section>}
      <p className="wellbeing-note">Estas são vivências de autocuidado inspiradas em abordagens terapêuticas. Não são psicoterapia, diagnóstico ou promessa de tratamento.</p>
    </Screen>
  );
  return (
    <main className="screen screen--tabs training-list training-list--general">
      {onBack && <button type="button" className="link" onClick={onBack}>← Voltar</button>}
      <p className="wellbeing-greeting">Vivências guiadas</p>
      <h1>Do que você precisa agora?</h1>
      <p className="muted">Escolha pelo que você precisa agora; não é preciso fazer tudo nem terminar hoje.</p>
      <div className="training-needs" role="group" aria-label="O que você precisa agora?">{NEEDS.map(([id, label]) => <Chip key={id} selected={need === id} onClick={() => setNeed(id)}>{label}</Chip>)}</div>
      <section className="training-today" aria-labelledby="convite-hoje">
        <p className="eyebrow">{need !== 'all' ? 'Uma opção para o que você escolheu' : 'Um convite para hoje'}</p>
        <h2 id="convite-hoje">{ofTheDay.title}</h2>
        <p className="small muted">{ofTheDay.why}</p>
        <div className="training-today__foot"><span className="small muted">{techniqueMinutes(ofTheDay)} min · {ofTheDay.steps.length} passos</span><button type="button" className="btn" aria-label={`Começar: ${ofTheDay.title}`} onClick={() => onOpen(ofTheDay.id)}>Começar</button></div>
      </section>
      {approachesFor(focus).filter((a) => need === 'all' || need === a.id).map((a) => (
        <section key={a.id} className={`training-approach training-approach--${a.id}`} aria-labelledby={`grupo-${a.id}`}>
          <header><span className="training-approach__icon"><Icon id={APPROACH_ICONS[a.id]} /></span><div><h2 id={`grupo-${a.id}`}>{a.title}</h2><p className="small muted">{a.what}</p></div></header>
          {items(a)}
          <details className="training-basis"><summary>De onde vêm estas práticas?</summary><p className="small">{a.name}</p><p className="muted small">{a.evidence}</p></details>
        </section>
      ))}
      <p className="wellbeing-note">Estas são vivências de autocuidado inspiradas em abordagens terapêuticas. Não são psicoterapia, diagnóstico ou promessa de tratamento.</p>
    </main>
  );
}

/** Vivências com respiração: o sol cresce e diminui a cada 4 s, no ritmo de quem respira devagar. */
const BREATH_TECHNIQUES = new Set(['pausa_corpo', 'preparar_sono']);
const BREATH_SECONDS = 4;

function Pause({ seconds, breath, onEnd }: { seconds: number; breath: boolean; onEnd: () => void }) {
  const [left, setLeft] = useState(seconds);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (left <= 0) { onEnd(); return; }
    if (paused) return;
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, onEnd]);
  const elapsed = seconds - left;
  const inhale = Math.floor(elapsed / BREATH_SECONDS) % 2 === 0;
  return <div className="training-pause">
    <div className="training-pause__ring" role="progressbar" aria-label="Tempo de pausa" aria-valuemin={0} aria-valuemax={seconds} aria-valuenow={elapsed} style={{ '--pause-angle': `${elapsed / seconds * 360}deg` } as CSSProperties}>
      <span className={`training-pause__sun${breath && !paused ? (inhale ? ' is-in' : ' is-out') : ''}`} aria-hidden="true" />
      <strong aria-hidden="true">{left}<span>segundos</span></strong>
    </div>
    <p className="training-pause__cue" aria-live="off">{paused ? 'Relógio pausado' : breath ? (inhale ? 'O ar entra…' : 'O ar sai…') : 'Sem pressa.'}</p>
    <button type="button" className="chip" onClick={() => setPaused((p) => !p)}>{paused ? 'Retomar relógio' : 'Pausar relógio'}</button>
  </div>;
}

const SAVED_WHERE: Partial<Record<PlanItemKind, string>> = {
  gentileza: 'Essa frase vai aparecer quando você registrar um dia difícil.',
  sinal_alerta: 'Fica guardado em Ajustes, no seu kit, para você reler.',
};
interface SessionProps { id: string; onDone: () => void; onMore: () => void; onBack: () => void; finishLabel?: string }

export function TrainingSession(props: SessionProps) {
  const technique = findTechnique(props.id);
  if (!technique) return <Screen title="Exercício não encontrado" onBack={props.onBack}><p className="muted">Escolha um na lista.</p></Screen>;
  return <TrainingExercise key={technique.id} {...props} technique={technique} />;
}

function TrainingExercise({ technique, onDone, onMore, onBack, finishLabel = 'Voltar ao início' }: SessionProps & { technique: Technique }) {
  const { repos, write } = useData();
  const general = supportFocus(repos) === 'general';
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { text: string; option?: string }>>({});
  const [pauseDone, setPauseDone] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [finishedPracticeId, setFinishedPracticeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'helped' | 'same' | 'harder' | null>(null);
  const [leaving, setLeaving] = useState(false);
  const finishedOnce = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const voice = canSpeak() && repos.settings.get('practiceVoice', false);
  const step = technique.steps[i];
  const total = technique.steps.length;
  const last = i === total - 1;
  const answer = answers[i] ?? { text: '' };
  // No foco geral, escolher também é opcional: a opção só ajuda a pensar.
  const needsOption = !general && !!step.options && !answer.option;
  // No foco geral, escrever é sempre opcional. A pessoa pode viver o exercício
  // sem entregar ou guardar algo íntimo.
  const missingRequiredCapture = !general && step.capture && !answer.text.trim();
  const blocked = !!(missingRequiredCapture || needsOption);
  const setText = (text: string) => setAnswers({ ...answers, [i]: { ...answer, text } });
  const phaseIcon: IconId = step.pauseSeconds ? 'ter_atencao' : step.capture || step.reflect ? 'passo_escrever' : step.options ? 'ferr_pensamento' : step.share ? 'ter_apoio' : 'ter_aceitacao';
  const phaseLabel = step.pauseSeconds ? 'Um momento de pausa' : step.capture ? 'Uma frase para levar' : step.reflect ? 'Um espaço para refletir' : step.options ? 'Escolha o que combina com você' : step.share ? 'Uma sugestão para mandar' : 'Observe com gentileza';

  useEffect(() => {
    if (i > 0) heading.current?.focus();
    if (voice && !finished && !leaving) say(technique.id, i, step.text);
    return () => { stopSpeaking(); stopNarratedAudio(); };
  }, [i, voice, step.text, technique.id, finished, leaving]);

  const requestBack = () => {
    if (Object.values(answers).some((a) => a.text.trim())) setLeaving(true);
    else onBack();
  };
  const finish = () => {
    if (finishedOnce.current) return;
    finishedOnce.current = true;
    const today = toLocalDate(new Date());
    const scores: Record<string, number> = {};
    let practiceId: string | null = null;
    write((r) => {
      technique.steps.forEach((s, idx) => {
        const a = answers[idx];
        if (s.capture && a?.text.trim()) r.plan.add({ kind: s.capture.kind, text: a.text.trim(), extra: a.option ? { thought: a.option } : null });
        if (s.score && a?.option !== undefined) scores[s.score] = Number(a.option);
        if (s.reflect?.journal && a?.text.trim()) {
          if (general) {
            const e = r.checkins.getByDate(today);
            saveWellbeingCheckin(r, today, { mood: e?.mood ?? null, stress: e?.stress ?? null, note: [e?.note, a.text.trim()].filter(Boolean).join('\n') });
          } else {
            const e = r.journal.getByDate(today);
            r.journal.upsert({ date: today, craving: e?.craving ?? null, triggers: e?.triggers ?? [], breaks: e?.breaks ?? 0, trick: e?.trick ?? null, victory: [e?.victory, a.text.trim()].filter(Boolean).join('; ') });
          }
        }
      });
      practiceId = r.practices.add(technique.id, today, scores).id;
    });
    setFinishedPracticeId(practiceId);
    setFinished(true);
  };
  if (finished) {
    const kinds = technique.steps.flatMap((s) => s.capture ? [s.capture.kind] : []);
    const toJournal = technique.steps.some((s, idx) => s.reflect?.journal && answers[idx]?.text.trim());
    const scored = technique.steps.some((s) => s.score);
    const where = toJournal ? (general ? 'Sua anotação foi para o seu Diário.' : 'As coisas boas de hoje foram para o seu Diário.') : scored ? 'Suas notas ficam no laboratório, para você ver como mudam com o tempo.' : general && kinds.length ? 'Sua frase ficou no kit pessoal, em Ajustes.' : kinds.map((k) => SAVED_WHERE[k]).find(Boolean);
    const savedCapture = technique.steps.some((s, idx) => s.capture && answers[idx]?.text.trim());
    const message = where && (toJournal || scored || savedCapture || !general) ? `Pronto. ${where}` : kinds.length && !general ? 'Pronto. O que você escreveu já está no seu SOS.' : 'Você reservou um momento para si. Tudo bem se ainda houver algo difícil por aí.';
    return <main className="screen training-finished">
      <div className="training-finished__sky" aria-hidden="true"><span className="training-finished__sun" /></div>
      <h1>{general ? 'Um cuidado feito.' : 'Feito.'}</h1>
      <p>{message}</p>
      <p className="muted">Você pode repetir quando fizer sentido. Não precisa fazer outra vivência agora.</p>
      {general && finishedPracticeId && <fieldset className="wellbeing-fieldset training-feedback"><legend>Como foi esta vivência para você?</legend><p className="small muted">Sua percepção ajuda a lembrar o que vale a pena repetir. É opcional e fica neste aparelho.</p><div className="training-feedback__list" role="group" aria-label="Como esta vivência pareceu?">{([['helped', 'Ajudou um pouco'], ['same', 'Não mudou'], ['harder', 'Ficou mais difícil']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={feedback === value} onClick={() => { write((r) => r.practices.setFeedback(finishedPracticeId, value)); setFeedback(value); }}>{label}</button>)}</div>{feedback && <p className="small" role="status">{feedback === 'harder' ? 'Obrigado por contar. Esta vivência não será sugerida automaticamente por enquanto; escolha outro tipo de cuidado se quiser.' : 'Obrigado. Você pode mudar essa resposta quando praticar de novo.'}</p>}{feedback === 'harder' && <button type="button" className="btn btn--ghost" onClick={onMore}>Ver outras opções</button>}</fieldset>}
      <div className="actions training-actions"><button type="button" className="btn btn--ghost" onClick={onMore}>Mais vivências</button><button type="button" className="btn" onClick={onDone}>{finishLabel}</button></div>
    </main>;
  }
  const field = step.capture ?? step.reflect;
  const hint: { icon: IconId; text: string } | null = step.capture
    ? { icon: 'dica', text: general ? 'Opcional. Se escrever, fica no seu kit pessoal ao concluir.' : 'Você escolhe o que escrever. Só fica guardado ao concluir a vivência.' }
    : step.reflect?.journal ? { icon: 'aba_diario', text: 'Opcional. Ao concluir, vai para o Diário de hoje.' }
    : step.reflect ? { icon: 'cadeado', text: 'Opcional. É só para você pensar: isto não fica guardado.' } : null;
  return <main className="screen training-session">
    <div className="training-top">
      <button type="button" className="training-close" aria-label="Sair da vivência" onClick={requestBack}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
      <div className="training-segments" role="progressbar" aria-label="Progresso da vivência" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i + 1}>{technique.steps.map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}</div>
      <span className="training-count">{i + 1} de {total}</span>
    </div>
    <p className="training-title">{technique.title}</p>
    <p className="training-phase"><Icon id={phaseIcon} />{phaseLabel}</p>
    {i === 0 && <p className="muted training-why">{technique.why}</p>}
    <h1 ref={heading} tabIndex={-1}>{step.text}</h1>
    {canSpeak() && <button type="button" className="player__voice" aria-pressed={voice} onClick={() => { if (voice) { stopSpeaking(); stopNarratedAudio(); } write((r) => r.settings.set('practiceVoice', !voice)); }}>{voice ? 'Voz ligada' : 'Ouvir este passo'}</button>}
    {step.share && <ShareBox text={step.share} />}
    {step.pauseSeconds && !pauseDone[i] && <Pause key={i} seconds={step.pauseSeconds} breath={BREATH_TECHNIQUES.has(technique.id)} onEnd={() => setPauseDone((p) => ({ ...p, [i]: true }))} />}
    {step.pauseSeconds && pauseDone[i] && <p className="training-pause-done" role="status">Pausa feita. Siga quando quiser.</p>}
    {step.options && <div className="chips" role="group" aria-label="Opções para este passo">{step.options.map((o) => <Chip key={o} selected={answer.option === o} onClick={() => setAnswers({ ...answers, [i]: { ...answer, option: general && answer.option === o ? undefined : o } })}>{o}</Chip>)}</div>}
    {field && (!step.options || general || answer.option) && <label className="field">{field.prompt}<textarea rows={4} placeholder={field.placeholder} value={answer.text} onChange={(e) => setText(e.target.value)} />{hint && <span className="training-hint"><Icon id={hint.icon} />{hint.text}</span>}</label>}
    {blocked && <p className="training-helper">{needsOption ? 'Escolha uma opção para continuar.' : 'Escreva uma frase para levar com você.'}</p>}
    <div className="actions training-actions">{i > 0 && <button type="button" className="btn btn--ghost" onClick={() => setI(i - 1)}>Voltar</button>}<button type="button" className="btn" disabled={blocked} onClick={last ? finish : () => setI(i + 1)}>{general && step.capture && !answer.text.trim() ? (last ? 'Concluir sem guardar' : 'Continuar sem guardar') : last ? 'Concluir' : step.pauseSeconds && !pauseDone[i] ? 'Pular a pausa' : 'Continuar'}</button></div>
    {leaving && <div className="sheet-backdrop" onClick={() => setLeaving(false)}><div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="sair-titulo" onClick={(e) => e.stopPropagation()}><h2 id="sair-titulo">Sair por agora?</h2><p>O que você escreveu ainda não foi guardado. Você pode continuar ou sair sem salvar.</p><button type="button" className="btn" autoFocus onClick={() => setLeaving(false)}>Continuar aqui</button><button type="button" className="btn btn--ghost" onClick={onBack}>Sair sem salvar</button></div></div>}
  </main>;
}
/** Texto pronto para mandar: abre o compartilhar do celular ou copia. Nada sai sem o toque da pessoa. */
function ShareBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      if (navigator.share) return await navigator.share({ text });
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // A pessoa cancelou o compartilhar ou o navegador não deixou copiar: o texto segue na tela.
    }
  };
  return (
    <div className="sharebox">
      <p className="sharebox__text">{text}</p>
      <button type="button" className="btn btn--ghost" onClick={share}>
        {copied ? 'Copiado' : 'Mandar ou copiar'}
      </button>
    </div>
  );
}

/** Toca a narração gravada do passo; sem arquivo, a voz do celular lê o texto. */
function say(techniqueId: string, step: number, text: string) {
  if (!TECHNIQUES.some((t) => t.id === techniqueId)) { speak(text); return; }
  void playNarration(trainingFile(techniqueId, step)).then((played) => {
    if (!played) speak(text);
  });
}

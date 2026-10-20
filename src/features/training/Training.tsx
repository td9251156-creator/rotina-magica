import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { PlanItemKind } from '@/data/repositories/types';
import { useData } from '@/data/provider';
import { toLocalDate } from '@/domain/dates';
import { PRACTICES, practiceSeconds, type PracticeId, type RoutineStyle } from '@/domain/routine';
import { approachesFor, approachOf, techniqueIds, type TherapyItem, type Approach } from '@/domain/therapies';
import { findTechnique, techniqueOfTheDay, techniqueMinutes, TECHNIQUES, type Technique } from '@/domain/training';
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

export function TrainingList({ onOpen, onBack }: { onOpen: (id: string) => void; onBack: () => void }) {
  const { repos, write } = useData();
  const [playing, setPlaying] = useState<PracticeId | null>(null);
  const [need, setNeed] = useState('all');
  const focus = supportFocus(repos);
  const general = focus === 'general';
  const today = toLocalDate(new Date());
  const practices = repos.practices.list();
  const times = (id: string) => practices.filter((p) => p.techniqueId === id).length;
  const selectedApproach = general && need !== 'all' ? approachesFor(focus).find((a) => a.id === need) : undefined;
  const latestFeedback = new Map<string, string>();
  practices.forEach((p) => { if (p.feedback) latestFeedback.set(p.techniqueId, p.feedback); });
  const ofTheDay = techniqueOfTheDay(today, practices.map((p) => p.techniqueId), repos.settings.get('trackingStartDate', today), focus, selectedApproach ? techniqueIds(selectedApproach) : undefined, [...latestFeedback].filter(([, f]) => f === 'harder').map(([id]) => id));
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
    if (item.kind === 'atalho') return { title: item.title, why: item.why, status: 'Abrir ferramenta', duration: '' };
    if (item.kind === 'pratica') {
      const p = PRACTICES[item.id];
      return { title: p.title, why: p.summary, status: 'Prática guiada', duration: `${Math.round(practiceSeconds(p) / 60)} min` };
    }
    const t = findTechnique(item.id);
    const practicedToday = practices.some((p) => p.techniqueId === item.id && p.date === today);
    return { title: t?.title ?? item.id, why: t?.why ?? '', status: practicedToday ? 'Praticado hoje · pode repetir' : times(item.id) ? `Praticado ${times(item.id)}×` : 'Conhecer esta vivência', duration: t ? `cerca de ${techniqueMinutes(t)} min · ${t.steps.length} passos` : '' };
  };
  const items = (a: Approach) => <div className="training-items">{a.items.map((item) => {
    const d = describe(item);
    return <button key={d.title} type="button" className="training-item" onClick={() => open(item)}><span className="training-item__icon"><Icon id={item.kind === 'atalho' ? 'seta' : APPROACH_ICONS[a.id]} /></span><span className="item__text"><strong>{d.title}</strong><span className="muted small">{d.why}</span>{d.duration && <span className="training-duration">{d.duration}</span>}<span className="therapy__status">{d.status}</span></span><Chevron /></button>;
  })}</div>;
  return (
    <Screen title={general ? 'Vivências guiadas' : 'Terapias e vivências'} onBack={onBack} className="training-list">
      <div className="training-landscape"><PathArt /></div>
      <p className="muted">{general ? 'Um espaço de autocuidado para momentos difíceis. Escolha pelo que você precisa agora; não é preciso fazer tudo nem terminar hoje.' : 'Exercícios curtos para preparar seu kit de apoio. Escolha um cuidado possível; você pode repetir ou parar quando quiser.'}</p>
      {general && <div className="training-needs" role="group" aria-label="O que você precisa agora?">{NEEDS.map(([id, label]) => <Chip key={id} selected={need === id} onClick={() => setNeed(id)}>{label}</Chip>)}</div>}
      <button type="button" className="next training-today" onClick={() => onOpen(ofTheDay.id)}><span className="eyebrow">{general && need !== 'all' ? 'Uma opção para o que você escolheu' : 'Um convite para hoje'} · cerca de {techniqueMinutes(ofTheDay)} min</span><span className="next__row"><span className="item__icon"><Icon id={APPROACH_ICONS[approachOf(ofTheDay.id)?.id ?? 'recaida']} /></span><span className="item__text"><strong>{ofTheDay.title}</strong><span className="muted small">{ofTheDay.why}</span></span><Chevron /></span></button>
      {approachesFor(focus).filter((a) => !general || need === 'all' || need === a.id).map((a) => {
        const ids = techniqueIds(a);
        const done = ids.filter((id) => times(id) > 0).length;
        if (!general) return <Setting key={a.id} title={a.title} hint={ids.length ? `${a.name} · ${done} de ${ids.length} ${ids.length === 1 ? 'feito' : 'feitos'}` : a.name} icon={<Icon id={APPROACH_ICONS[a.id]} />}><p className="small">{a.what}</p><p className="small muted evidence">Base: {a.evidence}</p>{items(a)}</Setting>;
        return <section key={a.id} className={`training-approach training-approach--${a.id}`}><header><span className="training-approach__icon"><Icon id={APPROACH_ICONS[a.id]} /></span><div><h2>{a.title}</h2><p className="small muted">{a.what}</p></div></header>{items(a)}<details className="training-basis"><summary>De onde vêm estas práticas?</summary><p className="small">{a.name}</p><p className="muted small">{a.evidence}</p></details></section>;
      })}
      {style === 'magica' && <section className="card card--kit"><h2>E a sua prática espiritual?</h2><p className="small">Se fizer sentido para você, ela pode fazer parte do seu cuidado. É opcional e não substitui acompanhamento profissional.</p><p className="small muted">Num dia difícil, faça só o básico, sem cobrança.</p></section>}
      <p className="wellbeing-note">Estas são vivências de autocuidado inspiradas em abordagens terapêuticas. Não são psicoterapia, diagnóstico ou promessa de tratamento.</p>
    </Screen>
  );
}

function Pause({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [left, setLeft] = useState(seconds);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (left <= 0) { onEnd(); return; }
    if (paused) return;
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, onEnd]);
  return <div className="training-pause"><div className="training-pause__ring" role="progressbar" aria-label="Tempo de pausa" aria-valuemin={0} aria-valuemax={seconds} aria-valuenow={seconds - left} style={{ '--pause-angle': `${(seconds - left) / seconds * 360}deg` } as CSSProperties}><strong aria-hidden="true">{left}<span>segundos</span></strong></div><p className="small muted">Você pode seguir antes ou pausar o relógio. Não há pressa.</p><button type="button" className="chip" onClick={() => setPaused((p) => !p)}>{paused ? 'Retomar relógio' : 'Pausar relógio'}</button></div>;
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
  const needsOption = !!step.options && !answer.option;
  const blocked = !!((step.capture && !answer.text.trim()) || needsOption);
  const setText = (text: string) => setAnswers({ ...answers, [i]: { ...answer, text } });
  const phaseIcon: IconId = step.pauseSeconds ? 'ter_atencao' : step.capture || step.reflect ? 'passo_escrever' : step.options ? 'ferr_pensamento' : 'ter_aceitacao';
  const phaseLabel = step.pauseSeconds ? 'Um momento de pausa' : step.capture ? 'Uma frase para levar' : step.reflect ? 'Um espaço para refletir' : step.options ? 'Escolha o que combina com você' : 'Observe com gentileza';

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
    return <Screen title={general ? 'Um cuidado feito.' : 'Feito.'} className="training-finished"><span className="training-finished__icon"><Icon id="feito" /></span><p>{where ? `Pronto. ${where}` : kinds.length ? 'Pronto. O que você escreveu já está no seu SOS.' : 'Você reservou um momento para si. Tudo bem se ainda houver algo difícil por aí.'}</p><p className="muted">Você pode repetir quando fizer sentido. Não precisa fazer outra vivência agora.</p>{general && finishedPracticeId && <fieldset className="wellbeing-fieldset"><legend>Como foi esta vivência para você?</legend><p className="small muted">Sua percepção ajuda a lembrar o que vale a pena repetir. É opcional e fica neste aparelho.</p><div className="chips" role="group" aria-label="Como esta vivência pareceu?">{([['helped', 'Ajudou um pouco'], ['same', 'Não mudou'], ['harder', 'Ficou mais difícil']] as const).map(([value, label]) => <button key={value} type="button" className={`chip${feedback === value ? ' chip--on' : ''}`} aria-pressed={feedback === value} onClick={() => { write((r) => r.practices.setFeedback(finishedPracticeId, value)); setFeedback(value); }}>{label}</button>)}</div>{feedback && <p className="small" role="status">Obrigado. Você pode mudar essa resposta quando praticar de novo.</p>}</fieldset>}<div className="actions"><button type="button" className="btn btn--ghost" onClick={onMore}>Mais vivências</button><button type="button" className="btn" onClick={onDone}>{finishLabel}</button></div></Screen>;
  }
  return <Screen onBack={requestBack} className="training-session">
    {leaving && <div className="card training-leave" role="alertdialog" aria-label="Sair da vivência?"><h2>Sair por agora?</h2><p>O que você escreveu ainda não foi guardado. Você pode continuar ou sair sem salvar.</p><div className="actions"><button type="button" className="btn" onClick={() => setLeaving(false)}>Continuar aqui</button><button type="button" className="btn btn--ghost" onClick={onBack}>Sair sem salvar</button></div></div>}
    <p className="eyebrow">{technique.title}</p>
    <div className="training-step-label"><span>Passo {i + 1} de {total}</span><span>cerca de {techniqueMinutes(technique)} min no total</span></div>
    <div className="steps" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }} role="progressbar" aria-label="Progresso da vivência" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i + 1}>{technique.steps.map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}</div>
    <div className="training-step-icon"><Icon id={phaseIcon} /></div>
    <p className="training-phase">{phaseLabel}</p>
    {i === 0 && <p className="muted">{technique.why}</p>}
    <h1 ref={heading} tabIndex={-1}>{step.text}</h1>
    {canSpeak() && <button type="button" className="player__voice" aria-pressed={voice} onClick={() => { if (voice) { stopSpeaking(); stopNarratedAudio(); } write((r) => r.settings.set('practiceVoice', !voice)); }}>{voice ? 'Voz ligada' : 'Ouvir este passo'}</button>}
    {step.share && <ShareBox text={step.share} />}
    {step.pauseSeconds && !pauseDone[i] && <Pause key={i} seconds={step.pauseSeconds} onEnd={() => setPauseDone((p) => ({ ...p, [i]: true }))} />}
    {step.pauseSeconds && pauseDone[i] && <p className="training-pause-done" role="status">Pausa feita. Siga quando quiser.</p>}
    {step.options && <div className="chips" role="group" aria-label="Opções para este passo">{step.options.map((o) => <Chip key={o} selected={answer.option === o} onClick={() => setAnswers({ ...answers, [i]: { ...answer, option: o } })}>{o}</Chip>)}</div>}
    {step.capture && (!step.options || answer.option) && <label className="field">{step.capture.prompt}<textarea rows={4} placeholder={step.capture.placeholder} value={answer.text} onChange={(e) => setText(e.target.value)} /><span className="small muted">Você escolhe o que escrever. Só fica guardado ao concluir a vivência.</span></label>}
    {step.reflect && <label className="field">{step.reflect.prompt}<textarea rows={4} placeholder={step.reflect.placeholder} value={answer.text} onChange={(e) => setText(e.target.value)} /><span className="small muted">{step.reflect.journal ? 'Opcional. Ao concluir, vai para o Diário de hoje.' : 'Opcional. É só para você pensar: isto não fica guardado.'}</span></label>}
    {blocked && <p className="training-helper">{needsOption ? 'Escolha uma opção para continuar.' : 'Escreva uma frase para levar com você.'}</p>}
    <div className="actions">{i > 0 && <button type="button" className="btn btn--ghost" onClick={() => setI(i - 1)}>Voltar</button>}<button type="button" className="btn" disabled={blocked} onClick={last ? finish : () => setI(i + 1)}>{last ? 'Concluir' : step.pauseSeconds && !pauseDone[i] ? 'Pular' : 'Continuar'}</button></div>
  </Screen>;
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

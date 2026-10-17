import { useEffect, useState, type ReactElement } from 'react';
import type { PlanItemKind } from '@/data/repositories/types';
import { useData } from '@/data/provider';
import { toLocalDate } from '@/domain/dates';
import { PRACTICES, practiceSeconds, type PracticeId, type RoutineStyle } from '@/domain/routine';
import { APPROACHES, approachOf, techniqueIds, type TherapyItem } from '@/domain/therapies';
import { findTechnique, techniqueOfTheDay, type TechniqueStep } from '@/domain/training';
import { navigate } from '@/router';
import { Chip } from '@/ui/Chip';
import { BoltIcon, Chevron, HeartIcon, ShieldIcon, SunIcon, WindIcon } from '@/ui/icons';
import { Screen } from '@/ui/Screen';
import { Setting } from '@/ui/Setting';
import { PracticePlayer } from '../routine/PracticePlayer';

const APPROACH_ICONS: Record<string, () => ReactElement> = {
  motivacao: BoltIcon,
  recaida: ShieldIcon,
  atencao: WindIcon,
  aceitacao: SunIcon,
  apoio: HeartIcon,
};

/** Terapias e vivências: os exercícios agrupados pela terapia de onde vêm, cada grupo abre com um toque. */
export function TrainingList({ onOpen, onBack }: { onOpen: (id: string) => void; onBack: () => void }) {
  const { repos, write } = useData();
  const [playing, setPlaying] = useState<PracticeId | null>(null);
  const today = toLocalDate(new Date());
  const practices = repos.practices.list();
  const times = (id: string) => practices.filter((p) => p.techniqueId === id).length;
  const ofTheDay = techniqueOfTheDay(today, practices.map((p) => p.techniqueId), repos.settings.get('trackingStartDate', today));
  const style = repos.settings.get<RoutineStyle | null>('routineStyle', null);

  if (playing) {
    const stop = () => setPlaying(null);
    return (
      <main className="screen">
        <PracticePlayer
          practice={PRACTICES[playing]}
          onStop={stop}
          onDone={() => {
            write((r) => r.practices.add(playing, today));
            stop();
          }}
        />
      </main>
    );
  }

  const open = (item: TherapyItem) => {
    if (item.kind === 'tecnica') onOpen(item.id);
    else if (item.kind === 'pratica') setPlaying(item.id);
    else navigate(item.route, item.param);
  };
  const describe = (item: TherapyItem): { title: string; why: string; status: string } => {
    if (item.kind === 'atalho') return { title: item.title, why: item.why, status: '' };
    if (item.kind === 'pratica') {
      const p = PRACTICES[item.id];
      return { title: p.title, why: p.summary, status: `guiada · ${Math.round(practiceSeconds(p) / 60)} min` };
    }
    const t = findTechnique(item.id);
    const n = times(item.id);
    return { title: t?.title ?? item.id, why: t?.why ?? '', status: n ? `feito ${n}×` : 'nova' };
  };
  const DayIcon = APPROACH_ICONS[approachOf(ofTheDay.id)?.id ?? 'recaida'];

  return (
    <Screen title="Terapias e vivências" onBack={onBack}>
      <p className="muted">
        Exercícios curtos das terapias que mais ajudam quem quer parar. Faça com a cabeça tranquila: o que você escreve vira o
        seu kit na Ajuda agora.
      </p>

      <button type="button" className="next" onClick={() => onOpen(ofTheDay.id)}>
        <span className="eyebrow">Sugestão de hoje · {approachOf(ofTheDay.id)?.title}</span>
        <span className="next__row">
          <span className="item__icon">
            <DayIcon />
          </span>
          <span className="item__text">
            <strong>{ofTheDay.title}</strong>
            <span className="muted small">{ofTheDay.why}</span>
          </span>
          <Chevron />
        </span>
      </button>

      {APPROACHES.map((a) => {
        const ids = techniqueIds(a);
        const done = ids.filter((id) => times(id) > 0).length;
        const Icon = APPROACH_ICONS[a.id];
        return (
          <Setting key={a.id} title={a.title} hint={`${a.name} · ${done} de ${ids.length} ${ids.length === 1 ? 'feito' : 'feitos'}`} icon={<Icon />}>
            <p className="small">{a.what}</p>
            <p className="small muted evidence">Base: {a.evidence}</p>
            <div className="list">
              {a.items.map((item) => {
                const d = describe(item);
                return (
                  <button key={d.title} type="button" className="item__body item__body--solo therapy" onClick={() => open(item)}>
                    <span className="item__text">
                      <strong>{d.title}</strong>
                      <span className="muted small">{d.why}</span>
                      {d.status && <span className={`therapy__status${d.status === 'nova' ? ' therapy__status--new' : ''}`}>{d.status}</span>}
                    </span>
                    <Chevron />
                  </button>
                );
              })}
            </div>
          </Setting>
        );
      })}

      {style === 'magica' && (
        <section className="card card--kit">
          <h2>E a sua prática espiritual?</h2>
          <p className="small">
            A rotina com ritual dá estrutura e calma ao dia, e isso ajuda. Ela soma ao tratamento e não o substitui: os próprios
            guias de magia avisam para não usar a prática para fugir de problemas reais.
          </p>
          <p className="small muted">Num dia difícil, faça só o básico, sem cobrança. Constância vale mais que intensidade.</p>
        </section>
      )}
    </Screen>
  );
}

function Pause({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return onEnd();
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onEnd]);
  return <p className="center big">{left > 0 ? `${left} s` : 'Pronto'}</p>;
}

/** Onde aparece o que a pessoa escreveu, para dizer no fim. O resto vai para o SOS. */
const SAVED_WHERE: Partial<Record<PlanItemKind, string>> = {
  gentileza: 'Essa frase vai aparecer quando você registrar um dia difícil.',
  sinal_alerta: 'Fica guardado em Ajustes, no seu kit, para você reler.',
};

export function TrainingSession({ id, onDone, onMore, onBack }: { id: string; onDone: () => void; onMore: () => void; onBack: () => void }) {
  const { write } = useData();
  const technique = findTechnique(id);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { text: string; option?: string }>>({});
  const [pauseDone, setPauseDone] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  if (!technique) {
    return (
      <Screen title="Exercício não encontrado" onBack={onBack}>
        <p className="muted">Escolha um na lista.</p>
      </Screen>
    );
  }

  const step: TechniqueStep = technique.steps[i];
  const total = technique.steps.length;
  const last = i === total - 1;
  const answer = answers[i] ?? { text: '' };
  const needsOption = !!step.options && !answer.option;
  const blocked = (step.capture && !answer.text.trim()) || needsOption;
  const setText = (text: string) => setAnswers({ ...answers, [i]: { ...answer, text } });

  const finish = () => {
    write((r) => {
      technique.steps.forEach((s, idx) => {
        const a = answers[idx];
        if (s.capture && a?.text.trim()) {
          r.plan.add({ kind: s.capture.kind, text: a.text.trim(), extra: a.option ? { thought: a.option } : null });
        }
      });
      r.practices.add(technique.id, toLocalDate(new Date()));
    });
    setFinished(true);
  };

  if (finished) {
    const kinds = technique.steps.flatMap((s) => (s.capture ? [s.capture.kind] : []));
    const where = kinds.map((k) => SAVED_WHERE[k]).find(Boolean);
    return (
      <Screen title="Feito.">
        <p>
          {where
            ? `Pronto. ${where}`
            : kinds.length
              ? 'Pronto. O que você escreveu já está no seu SOS.'
              : 'Pronto. Repetir de vez em quando é o que deixa isso à mão na hora difícil.'}
        </p>
        <div className="actions">
          <button type="button" className="btn btn--ghost" onClick={onMore}>
            Mais vivências
          </button>
          <button type="button" className="btn" onClick={onDone}>
            Voltar ao início
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen onBack={onBack}>
      <p className="eyebrow">{technique.title}</p>
      <div className="steps" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }} aria-hidden="true">
        {technique.steps.map((_, k) => (
          <span key={k} className={k <= i ? 'on' : ''} />
        ))}
      </div>
      <p className="muted small">
        Passo {i + 1} de {total}
      </p>
      {i === 0 && <p className="muted">{technique.why}</p>}
      <h1>{step.text}</h1>

      {step.pauseSeconds && !pauseDone[i] && (
        <Pause seconds={step.pauseSeconds} onEnd={() => setPauseDone((p) => ({ ...p, [i]: true }))} />
      )}

      {step.options && (
        <div className="chips">
          {step.options.map((o) => (
            <Chip key={o} selected={answer.option === o} onClick={() => setAnswers({ ...answers, [i]: { ...answer, option: o } })}>
              {o}
            </Chip>
          ))}
        </div>
      )}

      {step.capture && (!step.options || answer.option) && (
        <label className="field">
          {step.capture.prompt}
          <textarea rows={3} placeholder={step.capture.placeholder} value={answer.text} onChange={(e) => setText(e.target.value)} />
        </label>
      )}

      {step.reflect && (
        <label className="field">
          {step.reflect.prompt}
          <textarea rows={3} placeholder={step.reflect.placeholder} value={answer.text} onChange={(e) => setText(e.target.value)} />
          <span className="small">Opcional. É só para você pensar: isto não fica guardado.</span>
        </label>
      )}

      <div className="actions">
        {i > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => setI(i - 1)}>
            Voltar
          </button>
        )}
        {last ? (
          <button type="button" className="btn" disabled={blocked} onClick={finish}>
            Concluir
          </button>
        ) : (
          <button type="button" className="btn" disabled={blocked} onClick={() => setI(i + 1)}>
            {step.pauseSeconds && !pauseDone[i] ? 'Pular' : 'Continuar'}
          </button>
        )}
      </div>
    </Screen>
  );
}

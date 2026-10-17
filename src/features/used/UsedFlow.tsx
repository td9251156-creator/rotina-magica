import { useState } from 'react';
import { useData } from '@/data/provider';
import { BEFORE_TAGS, CARE_STEPS, TURNING_POINTS, suggestAdjustment } from '@/domain/care';
import { addDays, toLocalDate } from '@/domain/dates';
import { navigate } from '@/router';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';

type Step = 'when' | 'care' | 'questions' | 'adjust' | 'done';

/**
 * Depois de usar: registrar em 1 toque, sem sermão; cuidar; e, quando a pessoa quiser, 3 perguntas
 * que viram UM ajuste concreto no plano. Nada do progresso é apagado.
 */
export function UsedFlow({ onDone }: { onDone: () => void }) {
  const { repos, write } = useData();
  const kindWords = repos.plan.list('gentileza').at(-1)?.text;
  const startAtQuestions = window.location.hash.endsWith('/entender');
  const [step, setStep] = useState<Step>(startAtQuestions ? 'questions' : 'when');
  const [tags, setTags] = useState<string[]>([]);
  const [turning, setTurning] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState('');

  const log = (when: 'agora' | 'hoje' | 'ontem') => {
    const now = new Date();
    const occurredAt =
      when === 'agora'
        ? now.toISOString()
        : when === 'hoje'
          ? new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
          : `${addDays(toLocalDate(now), -1)}T23:00:00`;
    write((r) => r.useEvents.add({ occurredAt, amountSpent: null, note: null }));
    setStep('care');
  };

  const toggle = (t: string) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);

  const saveAdjustment = () => {
    // O contexto (o que veio antes, onde dava para mudar) fica junto do ajuste, para o laboratório.
    write((r) => r.plan.add({ kind: 'se_entao', text: adjustment.trim(), extra: { fromLapse: true, before: tags, turning } }));
    setStep('done');
  };

  if (step === 'when') {
    return (
      <Screen title="Registrar que usou" onBack={onDone}>
        <p className="muted">Sem julgamento. Isso é dado, não fracasso. Quando foi?</p>
        <div className="stack">
          <button type="button" className="option" onClick={() => log('agora')}>
            Agora há pouco
          </button>
          <button type="button" className="option" onClick={() => log('hoje')}>
            Mais cedo hoje
          </button>
          <button type="button" className="option" onClick={() => log('ontem')}>
            Ontem à noite
          </button>
        </div>
        <button type="button" className="link" onClick={() => setStep('questions')}>
          Já registrei, quero só entender o que aconteceu
        </button>
      </Screen>
    );
  }

  if (step === 'care') {
    return (
      <Screen title="Anotado. Agora, cuide de você.">
        <p>Nada do seu progresso foi apagado. Os dias sem usar continuam contando.</p>
        <ul className="ticks">
          {CARE_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="small muted">As horas depois de usar costumam pesar. Se a cabeça ficar muito escura, ligue:</p>
        <a className="option" href="tel:188">
          Ligar 188: CVV, 24h, gratuito
        </a>
        <a className="option" href="tel:192">
          Ligar 192: SAMU, se o corpo estiver mal (peito, coração acelerado, falta de ar)
        </a>
        <div className="actions">
          <button type="button" className="btn btn--ghost" onClick={onDone}>
            Depois
          </button>
          <button type="button" className="btn" onClick={() => setStep('questions')}>
            Entender o que houve (1 min)
          </button>
        </div>
      </Screen>
    );
  }

  if (step === 'questions') {
    return (
      <Screen title="O que veio antes?" onBack={onDone}>
        <p className="muted">Marque o que estava acontecendo. Pode ser mais de um.</p>
        <div className="chips">
          {BEFORE_TAGS.map((t) => (
            <Chip key={t} selected={tags.includes(t)} onClick={() => toggle(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <h2>Em que momento dava para mudar o rumo?</h2>
        <div className="chips">
          {TURNING_POINTS.map((t) => (
            <Chip key={t} selected={turning === t} onClick={() => setTurning(turning === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setAdjustment(suggestAdjustment(tags, turning));
              setStep('adjust');
            }}
          >
            Continuar
          </button>
        </div>
      </Screen>
    );
  }

  if (step === 'adjust') {
    return (
      <Screen title="Uma mudança para a próxima vez" onBack={() => setStep('questions')}>
        <p className="muted">Só uma. Edite com suas palavras. Ela entra no seu SOS.</p>
        <label className="field">
          Na próxima vez:
          <textarea rows={3} value={adjustment} onChange={(e) => setAdjustment(e.target.value)} />
        </label>
        <div className="actions">
          <button type="button" className="btn" disabled={!adjustment.trim()} onClick={saveAdjustment}>
            Guardar
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Guardado.">
      <p>Recaída faz parte de quase toda recuperação. O que importa é o que você aprende com ela, e você acabou de fazer isso.</p>
      {kindWords && (
        <div className="letter">
          <p className="eyebrow">Uma frase sua, para dias assim</p>
          <p>{kindWords}</p>
        </div>
      )}
      <div className="actions">
        {/* Depois de usar, a vergonha empurra para usar de novo: o exercício de autocompaixão vem primeiro. */}
        <button type="button" className="btn btn--ghost" onClick={() => navigate('treino', kindWords ? undefined : 'amigo')}>
          {kindWords ? 'Ver vivências' : 'Um exercício para agora'}
        </button>
        <button type="button" className="btn" onClick={onDone}>
          Voltar ao início
        </button>
      </div>
    </Screen>
  );
}

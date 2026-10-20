import { useState } from 'react';
import { useData } from '@/data/provider';
import { BODY_NEEDS, FEELINGS, TRAPS, bodyTip } from '@/domain/thinking';
import { Screen } from '@/ui/Screen';
import { supportFocus } from '@/domain/support';

const STEPS = ['Corpo', 'Emoção', 'Pensamento', 'Resposta'] as const;

function Chips({ options, value, onChange }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`chip${value.includes(o) ? ' chip--on' : ''}`}
          aria-pressed={value.includes(o)}
          onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/**
 * Desatar um pensamento: subir quatro degraus, do corpo ao melhor de si. É o registro de pensamentos
 * da terapia cognitivo-comportamental em linguagem simples.
 */
export function Untangle({ onBack }: { onBack: () => void }) {
  const { repos, write } = useData();
  const general = supportFocus(repos) === 'general';
  const [step, setStep] = useState(0);
  const [body, setBody] = useState<string[]>([]);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [thought, setThought] = useState('');
  const [traps, setTraps] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [best, setBest] = useState('');
  const [saved, setSaved] = useState(false);
  const tip = bodyTip(body);

  const save = () => {
    write((r) =>
      r.thoughts.add({ body, feelings, thought: thought.trim() || null, traps, answer: answer.trim() || null, best: best.trim() || null }),
    );
    setSaved(true);
  };

  if (saved)
    return (
      <Screen onBack={onBack}>
        <h1>Pensamento desatado.</h1>
        <p>Você parou, olhou com calma e respondeu. É assim que um hábito de pensar muda: um registro de cada vez.</p>
        {best.trim() && (
          <section className="card card--accent">
            <p className="eyebrow">Seu próximo passo</p>
            <p className="big">{best.trim()}</p>
          </section>
        )}
        <button type="button" className="btn" onClick={onBack}>
          Voltar
        </button>
      </Screen>
    );

  return (
    <Screen onBack={onBack}>
      <p className="eyebrow">
        Degrau {step + 1} de 4 · {STEPS[step]}
      </p>
      <div className="steps" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s} className={i <= step ? 'on' : ''} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h1>Como está seu corpo?</h1>
          <p className="muted">{general ? 'Fome, sono e cansaço podem deixar um dia difícil ainda mais pesado. Comece pelo que seu corpo precisa.' : 'Fome, sono e cansaço aumentam qualquer vontade. Comece por aqui.'}</p>
          <Chips options={BODY_NEEDS} value={body} onChange={setBody} />
          {tip && <p className="card card--accent">{tip}</p>}
        </>
      )}
      {step === 1 && (
        <>
          <h1>O que você está sentindo?</h1>
          <p className="muted">Dar nome à emoção já diminui a força dela. Pode marcar mais de uma.</p>
          <Chips options={FEELINGS} value={feelings} onChange={setFeelings} />
        </>
      )}
      {step === 2 && (
        <>
          <h1>O que sua cabeça está dizendo?</h1>
          <label className="field">
            Escreva do jeito que veio, sem filtro
            <textarea rows={3} value={thought} onChange={(e) => setThought(e.target.value)} placeholder={general ? 'Ex.: “Não vou dar conta de tudo.”' : 'Ex.: “Só hoje, eu mereço depois dessa semana”'} />
          </label>
          <p className="muted small">Algum destes jeitos de pensar aparece aí? Toque para ver a pergunta que desmonta.</p>
          <div className="stack">
            {TRAPS.map((t) => {
              const on = traps.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`trap${on ? ' trap--on' : ''}`}
                  aria-pressed={on}
                  onClick={() => setTraps(on ? traps.filter((x) => x !== t.id) : [...traps, t.id])}
                >
                  <strong>{t.name}</strong>
                  <span className="muted small">{t.example}</span>
                  {on && <span className="trap__q">{t.question}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h1>Uma resposta mais justa</h1>
          {thought.trim() && <blockquote className="quote">{thought.trim()}</blockquote>}
          <label className="field">
            O que você diria a um amigo que pensasse isso?
            <textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Ex.: Merecer é acordar bem amanhã. A vontade passa." />
          </label>
          <label className="field">
            O que a melhor versão de você faria agora?
            <input value={best} onChange={(e) => setBest(e.target.value)} placeholder="Ex.: Tomar um banho e jantar" />
          </label>
        </>
      )}

      <div className="actions">
        {step > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
            Voltar
          </button>
        )}
        {step < 3 ? (
          <button type="button" className="btn" onClick={() => (setStep(step + 1), window.scrollTo?.(0, 0))}>
            Próximo
          </button>
        ) : (
          <button type="button" className="btn" onClick={save}>
            Guardar
          </button>
        )}
      </div>
    </Screen>
  );
}

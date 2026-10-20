import { useEffect, useMemo, useRef, useState } from 'react';
import { createRng } from '@/domain/games/rng';
import {
  MAX_URGE,
  buildStory,
  choose,
  ending,
  isOver,
  startStory,
  storyScore,
  turningPoint,
  type StoryChoice,
  type StoryPersonal,
} from '@/domain/games/story';
import { useData } from '@/data/provider';
import { vibrate, type GameOutcome } from './record';
import { GameArt } from '@/ui/illustrations';
import { Icon } from '@/ui/icons';
import { GameProgress } from './GameGuide';

const ENDINGS = {
  dormiu: { title: 'Meia-noite. Você dormiu.', text: 'A vontade virou lembrança. Amanhã você acorda inteiro.' },
  apertado: { title: 'Foi apertado, mas a noite acabou.', text: 'Você atravessou. Veja abaixo o ponto que mais pesou para chegar mais leve da próxima vez.' },
  escapou: { title: 'A noite escapou neste ensaio.', text: 'Ensaio serve para isso: errar aqui custa nada. Olhe onde a vontade mais subiu. É ali que vale um plano.' },
};

export function StoryGame({ personal, onFinish }: { personal: StoryPersonal; onFinish: (o: GameOutcome) => void }) {
  const scenes = useMemo(() => buildStory(createRng(Date.now() % 100000), personal), [personal]);
  const [state, setState] = useState(startStory);
  const [picked, setPicked] = useState<StoryChoice | null>(null);
  const started = useRef(Date.now());
  const { repos, write } = useData();
  const [saved, setSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const over = isOver(state, scenes) && picked === null;

  useEffect(() => {
    if (picked) feedback.current?.scrollIntoView?.({ block: 'nearest' });
    else if (state.step > 0) heading.current?.focus();
  }, [picked, state.step]);

  const pick = (c: StoryChoice) => {
    if (picked) return;
    setPicked(c);
    setState((s) => choose(s, scenes[s.step], c));
    vibrate(c.delta > 0 ? [60, 40, 60] : 30);
  };

  if (over) {
    const end = ENDINGS[ending(state)];
    const turn = turningPoint(state);
    return (
      <div className="game story">
        <div className="story-scene"><GameArt id="noite" /></div>
        <div className="card">
          <p className="eyebrow">Seu ensaio terminou</p>
          <h2 ref={heading} tabIndex={-1}>{end.title}</h2>
          <p>{end.text}</p>
          {turn && (
            <p className="small">
              Onde mais pesou: <strong>{turn.choice}</strong> (vontade +{turn.delta}).
            </p>
          )}
        </div>
        {turn && (
          <div className="card nudge">
            <p className="small muted">Plano para esse momento</p>
            <p>
              <strong>{turn.plan}.</strong>
            </p>
            {saved ? (
              <p className="small">Guardado. Vai aparecer no seu SOS.</p>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  // O ensaio vira plano real: aparece no SOS e entra no ranking do que funciona.
                  if (!repos.plan.list('se_entao').some((i) => i.text === turn.plan))
                    write((r) => r.plan.add({ kind: 'se_entao', text: turn.plan, extra: { fromStory: true } }));
                  setSaved(true);
                }}
              >
                Guardar no meu SOS
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            onFinish({
              score: storyScore(state),
              durationMs: Date.now() - started.current,
              extra: { urge: state.urge, ending: ending(state), turning: turn?.choice ?? null },
            })
          }
        >
          Ver resultado
        </button>
      </div>
    );
  }

  const scene = scenes[picked ? state.step - 1 : state.step];
  return (
    <div className="game story">
      <GameProgress label="Momentos atravessados" value={state.step} max={scenes.length} />
      <div className="story-scene">
        <GameArt id="noite" />
        <span className="story-scene__time"><Icon id="jogo_noite" />{scene.time}</span>
      </div>
      <div className="story-meter">
        <div className="game__hud"><span>Vontade neste ensaio</span><strong>{state.urge}/{MAX_URGE}</strong></div>
        <div className="bar story__urge" role="progressbar" aria-label="Vontade neste ensaio" aria-valuemin={0} aria-valuemax={MAX_URGE} aria-valuenow={state.urge}>
          <span style={{ width: `${state.urge * 10}%` }} />
        </div>
      </div>
      {scene.fromData && <p className="small muted center">{scene.fromData}</p>}
      <div className="thought">
        <h2 ref={heading} tabIndex={-1}>{scene.text}</h2>
      </div>
      <div className="stack story-choices" role="group" aria-label="O que você faria?">
        <p className="eyebrow">O que você faria?</p>
        {scene.choices.map((c, i) => (
          <button
            key={c.text}
            type="button"
            className={`option story-choice${picked === c ? ' story-choice--picked' : ''}`}
            aria-pressed={picked === c}
            disabled={!!picked && picked !== c}
            onClick={() => pick(c)}
          >
            <span className="story-choice__number" aria-hidden="true">{i + 1}</span><span>{c.text}</span>
          </button>
        ))}
      </div>
      {picked && (
        <div ref={feedback} className="story-outcome">
          <div className="story-feedback" role="status">
            <strong>{picked.delta > 0 ? `Vontade +${picked.delta}` : picked.delta < 0 ? `Vontade ${picked.delta}` : 'Vontade igual'}</strong>
            <p>{picked.why}</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setPicked(null)}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

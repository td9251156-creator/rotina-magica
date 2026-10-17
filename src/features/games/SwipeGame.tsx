import { useEffect, useMemo, useRef, useState } from 'react';
import { createRng } from '@/domain/games/rng';
import { answer, buildDeck, cardTimeMs, correctDirection, initialSwipe, type Direction } from '@/domain/games/swipe';
import type { GameOutcome } from './record';
import { vibrate } from './record';

export function SwipeGame({ personalGood, onFinish }: { personalGood: string[]; onFinish: (o: GameOutcome) => void }) {
  const deck = useMemo(() => buildDeck(createRng(Date.now() % 2147483647), personalGood), [personalGood]);
  const [state, setState] = useState(initialSwipe);
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [dy, setDy] = useState(0);
  const [leaving, setLeaving] = useState<Direction | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; hint?: string } | null>(null);
  const [startedAt] = useState(() => Date.now());
  const start = useRef<number | null>(null);
  const done = state.index >= deck.length;
  const cue = deck[Math.min(state.index, deck.length - 1)];

  const decide = (direction: Direction | null) => {
    if (leaving || done) return;
    const ok = direction === correctDirection(cue);
    vibrate(ok ? 15 : [40, 40, 40]);
    setFeedback(ok ? { ok } : { ok, hint: correctDirection(cue) === 'empurrar' ? 'Esse era para empurrar ▲' : 'Esse era para puxar ▼' });
    setLeaving(direction ?? correctDirection(cue));
    setTimeout(() => {
      setState((s) => answer(s, cue, direction, Date.now() - shownAt));
      setLeaving(null);
      setDy(0);
      setShownAt(Date.now());
      setTimeout(() => setFeedback(null), ok ? 150 : 600);
    }, ok ? 180 : 650);
  };

  // Tempo esgotado conta como erro.
  const decideRef = useRef(decide);
  decideRef.current = decide;
  useEffect(() => {
    if (done || leaving) return;
    const id = setTimeout(() => decideRef.current(null), cardTimeMs(state.index));
    return () => clearTimeout(id);
  }, [state.index, leaving, done]);

  useEffect(() => {
    if (done) onFinish({ score: state.score, durationMs: Date.now() - startedAt, extra: { hits: state.hits, misses: state.misses, bestCombo: state.bestCombo } });
  }, [done]);

  if (done) return null;

  const transform = leaving
    ? leaving === 'empurrar'
      ? 'translateY(-160%) scale(0.4)'
      : 'translateY(120%) scale(1.5)'
    : `translateY(${dy}px) scale(${1 + dy / 600})`;

  return (
    <div className="game swipe">
      <div className="game__hud">
        <span>
          <strong>{state.score}</strong> pontos
        </span>
        <span>{state.combo >= 3 ? `combo ${state.combo}` : ' '}</span>
        <span>
          {state.index + 1}/{deck.length}
        </span>
      </div>
      <p className="center small muted">▲ empurre o que leva ao uso · ▼ puxe o que você quer</p>
      <div
        className="swipe__stage"
        onPointerDown={(e) => {
          start.current = e.clientY;
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => start.current !== null && setDy(e.clientY - start.current)}
        onPointerUp={() => {
          start.current = null;
          if (dy < -60) decide('empurrar');
          else if (dy > 60) decide('puxar');
          else setDy(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDy(0);
        }}
      >
        <div
          key={state.index}
          className="swipe__card"
          role="img"
          aria-label={`Carta: ${cue.text}`}
          style={{ transform, transition: start.current !== null ? 'none' : undefined }}
        >
          {cue.text}
        </div>
        <div className="swipe__timer" key={`t${state.index}`} style={{ animationDuration: `${cardTimeMs(state.index)}ms` }} />
      </div>
      <p className={`center feedback${feedback ? (feedback.ok ? ' ok' : ' bad') : ''}`} aria-live="polite">
        {feedback ? (feedback.ok ? '✓' : feedback.hint) : ' '}
      </p>
      <div className="row">
        <button type="button" className="option" onClick={() => decide('empurrar')}>
          ▲ Empurrar
        </button>
        <button type="button" className="option" onClick={() => decide('puxar')}>
          ▼ Puxar
        </button>
      </div>
    </div>
  );
}

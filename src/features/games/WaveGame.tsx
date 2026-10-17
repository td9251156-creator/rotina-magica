import { useEffect, useRef, useState } from 'react';
import { CYCLES, HOLD_TARGET_MS, scoreCycle, waveHeight, type CycleResult } from '@/domain/games/wave';
import type { GameOutcome } from './record';
import { vibrate } from './record';

type Phase = 'pronto' | 'inspire' | 'segure' | 'solte';
const MAX_EXHALE_MS = 12000;

export function WaveGame({ onFinish }: { onFinish: (o: GameOutcome) => void }) {
  const [phase, setPhase] = useState<Phase>('pronto');
  const [results, setResults] = useState<CycleResult[]>([]);
  const [tip, setTip] = useState('Segure o dedo no círculo e puxe o ar.');
  const [now, setNow] = useState(() => Date.now());
  const pressAt = useRef(0);
  const releaseAt = useRef<number | null>(null);
  const lastHold = useRef(0);
  const [startedAt] = useState(() => Date.now());
  const done = results.length >= CYCLES;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);

  const closeCycle = (exhaleMs: number) => {
    const r = scoreCycle(lastHold.current, exhaleMs);
    setTip(r.tip);
    setResults((rs) => [...rs, r]);
    releaseAt.current = null;
  };

  // Fase visual enquanto segura: 4 s puxando, depois segurando.
  useEffect(() => {
    if (phase === 'inspire' && now - pressAt.current >= 4000) {
      setPhase('segure');
      vibrate(20);
    }
    if (phase === 'segure' && now - pressAt.current >= HOLD_TARGET_MS) vibrate(10);
    if (phase === 'solte' && releaseAt.current && now - releaseAt.current > MAX_EXHALE_MS) {
      closeCycle(MAX_EXHALE_MS);
      setPhase('pronto');
    }
  }, [now, phase]); // eslint-disable-line

  useEffect(() => {
    if (done) {
      const score = results.reduce((s, r) => s + r.points, 0);
      onFinish({ score, durationMs: Date.now() - startedAt, extra: { cycles: results.length } });
    }
  }, [done]); // eslint-disable-line

  const press = () => {
    if (done) return;
    if (releaseAt.current) closeCycle(Date.now() - releaseAt.current);
    pressAt.current = Date.now();
    setPhase('inspire');
    vibrate(15);
  };
  const release = () => {
    if (phase !== 'inspire' && phase !== 'segure') return;
    lastHold.current = Date.now() - pressAt.current;
    releaseAt.current = Date.now();
    setPhase('solte');
    vibrate(15);
    // No último ciclo, a expiração fecha sozinha depois de 6 s.
    if (results.length === CYCLES - 1)
      setTimeout(() => {
        if (releaseAt.current) closeCycle(Date.now() - releaseAt.current);
      }, 6000);
  };

  const held = phase === 'inspire' || phase === 'segure' ? now - pressAt.current : 0;
  const exhale = phase === 'solte' && releaseAt.current ? now - releaseAt.current : 0;
  const scale = phase === 'inspire' ? 0.55 + 0.45 * Math.min(1, held / 4000) : phase === 'segure' ? 1 : phase === 'solte' ? Math.max(0.55, 1 - 0.45 * (exhale / 6000)) : 0.55;
  const label = { pronto: 'Segure o dedo e puxe o ar', inspire: 'Puxe o ar…', segure: 'Segure o ar…', solte: 'Solte o dedo e o ar, devagar…' }[phase];

  return (
    <div className="game wave">
      <div className="game__hud">
        <span>
          Ciclo <strong>{Math.min(results.length + 1, CYCLES)}</strong>/{CYCLES}
        </span>
        <span>{results.length ? `${results.at(-1)!.points} pts` : ' '}</span>
      </div>
      <div className="wave__sea" aria-hidden="true">
        <div className="wave__water" style={{ height: `${waveHeight(results)}%` }} />
      </div>
      <button
        type="button"
        className="wave__pad"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            press();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
        aria-label="Segure para puxar o ar, solte para expirar"
      >
        <span className="wave__circle" style={{ transform: `scale(${scale})` }} />
        <span className="wave__label">{label}</span>
      </button>
      <p className="center small muted" aria-live="polite">
        {tip}
      </p>
    </div>
  );
}

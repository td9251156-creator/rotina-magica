import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CYCLES, EXHALE_TARGET_MS, HOLD_TARGET_MS, scoreCycle, waveHeight, type CycleResult } from '@/domain/games/wave';
import type { GameOutcome } from './record';
import { vibrate } from './record';
import { GameProgress } from './GameGuide';

type Phase = 'pronto' | 'inspire' | 'segure' | 'solte';
const MAX_EXHALE_MS = 12000;

export function WaveGame({ onFinish }: { onFinish: (o: GameOutcome) => void }) {
  const [phase, setPhase] = useState<Phase>('pronto');
  const [results, setResults] = useState<CycleResult[]>([]);
  const [tip, setTip] = useState('Não precisa acertar perfeito. Respire de um jeito confortável.');
  const [now, setNow] = useState(() => Date.now());
  const pressAt = useRef(0);
  const releaseAt = useRef<number | null>(null);
  const releaseCue = useRef(false);
  const lastHold = useRef(0);
  const finished = useRef(false);
  const [startedAt] = useState(() => Date.now());
  const done = results.length >= CYCLES;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);

  const closeCycle = useCallback((exhaleMs: number) => {
    if (releaseAt.current === null) return;
    releaseAt.current = null;
    const result = scoreCycle(lastHold.current, exhaleMs);
    setTip(result.tip);
    setResults((rs) => rs.length < CYCLES ? [...rs, result] : rs);
    setPhase('pronto');
  }, []);

  // Um aviso ao fim dos 6 s; não vibra de novo a cada atualização do relógio.
  useEffect(() => {
    if (done) return;
    const held = now - pressAt.current;
    if (phase === 'inspire' && held >= 4000) {
      setPhase('segure');
      vibrate(20);
    }
    if (phase === 'segure' && held >= HOLD_TARGET_MS && !releaseCue.current) {
      releaseCue.current = true;
      vibrate(15);
    }
    if (phase === 'solte' && releaseAt.current !== null) {
      const limit = results.length === CYCLES - 1 ? EXHALE_TARGET_MS : MAX_EXHALE_MS;
      if (now - releaseAt.current >= limit) closeCycle(limit);
    }
  }, [now, phase, results.length, done, closeCycle]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onFinish({ score: results.reduce((sum, r) => sum + r.points, 0), durationMs: Date.now() - startedAt, extra: { cycles: results.length } });
  }, [onFinish, results, startedAt]);

  useEffect(() => {
    if (done) finish();
  }, [done, finish]);

  // Uma troca de aba interrompe a respiração atual sem registrar um ciclo por engano.
  useEffect(() => {
    const onHide = () => {
      if (!document.hidden) return;
      releaseAt.current = null;
      releaseCue.current = false;
      setPhase('pronto');
      setTip('Quando voltar, comece outro ciclo no seu ritmo.');
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const press = () => {
    if (done || phase === 'inspire' || phase === 'segure') return;
    if (releaseAt.current !== null) {
      closeCycle(Date.now() - releaseAt.current);
      if (results.length === CYCLES - 1) return;
    }
    pressAt.current = Date.now();
    releaseCue.current = false;
    setNow(Date.now());
    setPhase('inspire');
    vibrate(15);
  };
  const release = () => {
    if (phase !== 'inspire' && phase !== 'segure') return;
    lastHold.current = Date.now() - pressAt.current;
    releaseAt.current = Date.now();
    setNow(Date.now());
    setPhase('solte');
    vibrate(15);
  };
  const cancel = () => {
    releaseAt.current = null;
    setPhase('pronto');
    setTip('Pode recomeçar. Segure o dedo no círculo quando estiver pronto.');
  };

  const held = phase === 'inspire' || phase === 'segure' ? Math.max(0, now - pressAt.current) : 0;
  const exhale = phase === 'solte' && releaseAt.current !== null ? Math.max(0, now - releaseAt.current) : 0;
  const scale = phase === 'inspire' ? 0.55 + 0.45 * Math.min(1, held / 4000) : phase === 'segure' ? 1 : phase === 'solte' ? Math.max(0.55, 1 - 0.45 * (exhale / EXHALE_TARGET_MS)) : 0.55;
  const label = { pronto: 'Segure o dedo e puxe o ar', inspire: 'Puxe o ar…', segure: held >= HOLD_TARGET_MS ? 'Agora solte o dedo e o ar…' : 'Segure o ar…', solte: 'Solte o dedo e o ar, devagar…' }[phase];
  const seconds = Math.max(0, Math.ceil((phase === 'inspire' ? 4000 - held : phase === 'segure' ? HOLD_TARGET_MS - held : EXHALE_TARGET_MS - exhale) / 1000));
  const progress = phase === 'inspire' ? held / 4000 : phase === 'segure' ? (held - 4000) / 2000 : phase === 'solte' ? exhale / EXHALE_TARGET_MS : 0;

  return (
    <div className={`game wave wave--${phase}`}>
      <GameProgress label="Ciclos concluídos" value={results.length} max={CYCLES} />
      <div className="wave__sea" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}illustrations/games/onda.webp`} alt="" />
        <div className="wave__water" style={{ height: `${waveHeight(results)}%` }} />
      </div>
      <ol className="wave__steps" aria-label="Ritmo da respiração">
        {(['inspire', 'segure', 'solte'] as const).map((step, i) => <li key={step} className={phase === step ? 'is-active' : ''} aria-current={phase === step ? 'step' : undefined}><strong>{['4 s', '2 s', '6 s'][i]}</strong><span>{['Puxe', 'Segure', 'Solte'][i]}</span></li>)}
      </ol>
      <button
        type="button"
        className="wave__pad"
        onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture?.(e.pointerId); press(); }}
        onPointerUp={release}
        onPointerCancel={cancel}
        onClick={(event) => {
          if (event.detail === 0) {
            if (phase === 'inspire' || phase === 'segure') release();
            else press();
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Segure para puxar o ar e solte para expirar; no teclado, ative uma vez para começar e outra para soltar"
      >
        <span className="wave__orb" style={{ '--breath-progress': `${Math.min(1, progress) * 360}deg` } as CSSProperties}>
          <span className="wave__circle" style={{ transform: `scale(${scale})` }} />
          <span className="wave__count" aria-hidden="true">{phase === 'pronto' ? 'Toque' : seconds > 0 ? seconds : phase === 'segure' ? 'Solte' : 'Pronto'}</span>
        </span>
        <span className="wave__label" role="status">{label}</span>
        <span className="wave__gesture">{phase === 'solte' && exhale >= EXHALE_TARGET_MS ? 'Quando quiser, comece outro ciclo.' : 'Segure para começar · solte para expirar'}</span>
      </button>
      <p className="game-feedback center" aria-live="polite">{tip}</p>
      <button type="button" className="chip wave__finish" onClick={finish}>Terminar</button>
    </div>
  );
}

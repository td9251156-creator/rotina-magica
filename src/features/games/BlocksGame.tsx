import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COLOR_INDEX,
  COLS,
  ROWS,
  SHAPES,
  cells,
  ghost,
  gravityMs,
  grounded,
  hardDrop,
  holdPiece,
  move,
  newGame,
  rotatePiece,
  softDrop,
  tick,
  type BlocksState,
  type PieceType,
} from '@/domain/games/blocks';
import { sephirah } from '@/domain/games/symbols';
import { formatRemaining } from '@/domain/urge';
import type { GameOutcome } from './record';
import { vibrate } from './record';
import { GameProgress } from './GameGuide';

const COLORS = ['', '#7FC8A9', '#E8C15B', '#B68CE8', '#6FB7E8', '#E8875B', '#5B8DE8', '#E8A35B'];
const colorOf = (t: PieceType) => COLORS[COLOR_INDEX[t]];
/** Tempo que a peça apoiada espera antes de travar: dá para ainda escorregar para o lado. */
const LOCK_DELAY_MS = 500;

const CLEAR_NAMES = ['', 'Linha!', 'Duas linhas!', 'Três linhas!', 'Quatro linhas!'];

function ControlIcon({ action }: { action: 'hold' | 'left' | 'rotate' | 'right' | 'drop' }) {
  const paths = {
    hold: 'M8 20V4M4 8l4-4 4 4M16 4v16m-4-4 4 4 4-4',
    left: 'M20 12H4m6-6-6 6 6 6',
    rotate: 'M20 10a8 8 0 1 0-2 8M20 4v6h-6',
    right: 'M4 12h16m-6-6 6 6-6 6',
    drop: 'M12 3v13m-5-5 5 5 5-5M5 21h14',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[action]} /></svg>;
}

interface Props {
  /** Com duração (modo SOS), o jogo não acaba quando enche: recomeça e o relógio manda. */
  durationMs?: number;
  /** Com símbolos: cada nível é uma esfera da Árvore da Vida, de Malkuth a Kether. */
  tree?: boolean;
  /** Modo rápido: a partida começa num nível mais alto. */
  startLevel?: number;
  onFinish: (o: GameOutcome) => void;
}

/** Peça pequena (para "guardada" e "próximas"). */
function Mini({ type, dim }: { type: PieceType | null; dim?: boolean }) {
  if (!type) return <span className="mini mini--empty" />;
  const shape = SHAPES[type].filter((row) => row.some(Boolean));
  return (
    <span className={`mini${dim ? ' mini--dim' : ''}`}>
      {shape.map((row, y) => (
        <span key={y} className="mini__row">
          {row.map((v, x) => (
            <i key={x} style={{ background: v ? colorOf(type) : 'transparent' }} />
          ))}
        </span>
      ))}
    </span>
  );
}

export function BlocksGame({ durationMs, tree, startLevel = 1, onFinish }: Props) {
  const endless = durationMs !== undefined;
  const [state, setState] = useState<BlocksState>(() => newGame(Date.now() % 2147483647, startLevel));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<{
    text: string;
    big: boolean;
    key: number;
  } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const finished = useRef(false);
  const drag = useRef<{
    x: number;
    y: number;
    t: number;
    moved: number;
  } | null>(null);
  const running = !state.over && !paused;

  const act = useCallback(
    (fn: (s: BlocksState) => BlocksState) => {
      if (!paused && !finished.current) setState((s) => s.over ? s : fn(s));
    },
    [paused],
  );

  const finish = useCallback(
    (s: BlocksState) => {
      if (finished.current) return;
      finished.current = true;
      onFinish({
        score: s.score,
        durationMs: Date.now() - startedAt,
        extra: { lines: s.lines, level: s.level, ...(startLevel > 1 ? { fast: true } : {}) },
      });
    },
    [onFinish, startedAt],
  );

  // Gravidade. Peça apoiada espera um pouco antes de travar, como nos Tetris de verdade.
  const isGrounded = grounded(state);
  useEffect(() => {
    if (!running) return;
    const wait = isGrounded ? Math.max(LOCK_DELAY_MS, gravityMs(state.level)) : gravityMs(state.level);
    const id = setTimeout(() => setState((s) => tick(s, endless)), wait);
    return () => clearTimeout(id);
    // Só reinicia quando a peça desce ou muda: mexer para os lados não segura a gravidade para sempre.
  }, [state.piece.y, state.piece.type, state.board, state.level, running, isGrounded, endless]);

  // Sai do app ou troca de aba: pausa sozinho (fora do modo SOS, que corre contra o relógio).
  useEffect(() => {
    if (endless) return;
    const onHide = () => document.hidden && setPaused(true);
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [endless]);

  // Relógio do modo SOS.
  useEffect(() => {
    if (!endless) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [endless]);

  const remaining = endless ? durationMs - (now - startedAt) : Infinity;
  useEffect(() => {
    if (state.over || remaining <= 0) finish(state);
  }, [state, remaining, finish]);

  // Comemora linhas, sequências e subida de nível.
  const seen = useRef({ locks: 0, level: 1 });
  useEffect(() => {
    const prev = seen.current;
    seen.current = { locks: state.locks, level: state.level };
    if (state.level > prev.level) {
      vibrate([30, 40, 30]);
      const name = tree ? `${sephirah(state.level).name}, ${sephirah(state.level).meaning}` : `Nível ${state.level}`;
      setToast({ text: `${name} · mais rápido`, big: true, key: state.locks });
      return;
    }
    const c = state.lastClear;
    if (state.locks === prev.locks || !c) return;
    vibrate(c.lines === 4 ? [40, 30, 40] : 30);
    const extras = [c.backToBack ? 'em sequência' : '', c.combo > 0 ? `combo ×${c.combo + 1}` : ''].filter(Boolean).join(' · ');
    setToast({
      text: `${CLEAR_NAMES[c.lines]} +${c.points}${extras ? ` · ${extras}` : ''}`,
      big: c.lines === 4,
      key: state.locks,
    });
  }, [state.locks, state.level, state.lastClear, tree]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1100);
    return () => clearTimeout(id);
  }, [toast]);

  // Teclado (para jogar no PC).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'Escape') {
        e.preventDefault();
        if (e.repeat) return;
        if (!endless) setPaused((p) => !p);
        return;
      }
      // Espaço e Enter em um botão devem ativar só aquele controle.
      if (e.target instanceof Element && e.target.closest('button, input, textarea, select, summary, [contenteditable="true"]')) return;
      const map: Record<string, (s: BlocksState) => BlocksState> = {
        ArrowLeft: (s) => move(s, -1),
        ArrowRight: (s) => move(s, 1),
        ArrowUp: rotatePiece,
        ArrowDown: (s) => softDrop(s, endless),
        ' ': (s) => hardDrop(s, endless),
        c: holdPiece,
        Shift: holdPiece,
      };
      if (map[e.key]) {
        e.preventDefault();
        act(map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [act, endless]);

  // Desenho: blocos com luz em cima e sombra embaixo; sombra da queda só com o contorno.
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext?.('2d');
    if (!c || !ctx) return;
    const pixels = Math.round(c.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2));
    if (pixels > 0 && c.width !== pixels) {
      c.width = pixels;
      c.height = pixels * ROWS / COLS;
    }
    const size = c.width / COLS;
    ctx.fillStyle = '#0d1018';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(201, 164, 92, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * size + 0.5, 0);
      ctx.lineTo(x * size + 0.5, c.height);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * size + 0.5);
      ctx.lineTo(c.width, y * size + 0.5);
      ctx.stroke();
    }
    const block = (x: number, y: number, color: string) => {
      if (y < 0) return;
      const px = x * size;
      const py = y * size;
      const b = Math.max(2, Math.round(size / 7));
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillRect(px + 1, py + 1, size - 2, b);
      ctx.fillRect(px + 1, py + 1, b, size - 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(px + 1, py + size - 1 - b, size - 2, b);
      ctx.fillRect(px + size - 1 - b, py + 1, b, size - 2);
    };
    const outline = (x: number, y: number, color: string) => {
      if (y < 0) return;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2;
      ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
      ctx.globalAlpha = 1;
    };
    state.board.forEach((row, y) => row.forEach((v, x) => v && block(x, y, COLORS[v])));
    const color = colorOf(state.piece.type);
    cells(ghost(state)).forEach(([x, y]) => outline(x, y, color));
    cells(state.piece).forEach(([x, y]) => block(x, y, color));
  }, [state]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (paused || drag.current || e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !canvas.current) return;
    const cell = canvas.current.getBoundingClientRect().width / COLS;
    const steps = Math.trunc((e.clientX - d.x) / cell);
    if (steps !== 0) {
      act((s) => {
        for (let i = 0; i < Math.abs(steps); i++) s = move(s, Math.sign(steps));
        return s;
      });
      d.x += steps * cell;
      d.moved += Math.abs(steps);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dy = e.clientY - d.y;
    const quick = Date.now() - d.t < 400;
    if (dy > 60 && quick) act((s) => hardDrop(s, endless));
    else if (dy < -60 && quick && d.moved === 0) act(holdPiece);
    else if (d.moved === 0 && Math.abs(dy) < 15) act(rotatePiece);
  };

  return (
    <div className="game blocks-game">
      <div className="game__hud">
        <span>
          <strong>{state.score}</strong> pontos
        </span>
        {endless ? (
          <span>{formatRemaining(remaining)}</span>
        ) : (
          <button type="button" className="chip" onClick={() => setPaused(true)} disabled={paused}>
            Pausar
          </button>
        )}
      </div>
      {!endless && <GameProgress label={`Linhas para o nível ${state.level + 1}`} value={state.lines % 10} max={10} />}
      <div className="tetris">
        <div className="tetris__side">
          <button
            type="button"
            className="tetris__box"
            onClick={() => act(holdPiece)}
            disabled={!state.canHold}
            aria-label={state.hold ? `Guardada: ${state.hold}. Toque para trocar` : 'Guardar a peça'}
          >
            <span className="tetris__label">Guardar</span>
            <Mini type={state.hold} dim={!state.canHold} />
          </button>
          <div className="tetris__stat">
            <span className="tetris__label">Nível</span>
            <strong>{state.level}</strong>
            {tree && <span className="tetris__sphere">{sephirah(state.level).name}</span>}
          </div>
          <div className="tetris__stat">
            <span className="tetris__label">Linhas</span>
            <strong>{state.lines}</strong>
          </div>
        </div>
        <div className="tetris__well">
          <canvas
            ref={canvas}
            className="blocks"
            width={COLS * 24}
            height={ROWS * 24}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { drag.current = null; }}
            onLostPointerCapture={() => { drag.current = null; }}
            tabIndex={0}
            aria-label="Tabuleiro: toque para girar, arraste para os lados, deslize para baixo para soltar e para cima para guardar"
          />
          {toast && (
            <p key={toast.key} className={`tetris__toast${toast.big ? ' tetris__toast--big' : ''}`} role="status">
              {toast.text}
            </p>
          )}
          {paused && (
            <div className="tetris__pause">
              <p>Pausado</p>
              <button type="button" className="btn" onClick={() => setPaused(false)}>
                Continuar
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => finish(state)}>
                Terminar
              </button>
            </div>
          )}
        </div>
        <div className="tetris__side" aria-label={`Próximas: ${state.next.join(', ')}`}>
          <span className="tetris__label">Próximas</span>
          {state.next.map((t, k) => (
            <span key={k} className={`tetris__box tetris__box--next${k === 0 ? ' tetris__box--first' : ''}`}>
              <Mini type={t} />
            </span>
          ))}
        </div>
      </div>
      <div className="pad pad--five">
        <button type="button" aria-label="Guardar" onClick={() => act(holdPiece)} disabled={paused || !state.canHold}>
          <ControlIcon action="hold" /><span>Guardar</span>
        </button>
        <button type="button" aria-label="Esquerda" disabled={paused} onClick={() => act((s) => move(s, -1))}>
          <ControlIcon action="left" /><span>Esquerda</span>
        </button>
        <button type="button" aria-label="Girar" disabled={paused} onClick={() => act(rotatePiece)}>
          <ControlIcon action="rotate" /><span>Girar</span>
        </button>
        <button type="button" aria-label="Direita" disabled={paused} onClick={() => act((s) => move(s, 1))}>
          <ControlIcon action="right" /><span>Direita</span>
        </button>
        <button type="button" aria-label="Soltar" disabled={paused} onClick={() => act((s) => hardDrop(s, endless))}>
          <ControlIcon action="drop" /><span>Soltar</span>
        </button>
      </div>
      {!endless && <p className="game-hint">Toque para girar · arraste para mover · a sombra guia a queda</p>}
      {state.toppedOut > 0 && endless && <p className="center small muted">Encheu? Sem problema, recomeça sozinho. Continue.</p>}
    </div>
  );
}

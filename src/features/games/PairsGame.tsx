import { useEffect, useMemo, useRef, useState } from 'react';
import { HINT_COST, SHUFFLE_COST, SYMBOLS, canMatch, dailyPairsChallenge, deal, findPair, isFree, pairPoints, reshuffle, type LayoutId, type Tile } from '@/domain/games/mahjong';
import { createRng } from '@/domain/games/rng';
import { toLocalDate } from '@/domain/dates';
import type { Sign } from '@/domain/games/symbols';
import { Glyph } from './Glyph';
import { vibrate, type GameOutcome } from './record';

const MODES: { id: LayoutId; title: string; detail: string }[] = [
  { id: 'curta', title: 'Partida curta', detail: '34 peças · uns 3 minutos' },
  { id: 'jardim', title: 'Jardim', detail: '44 peças · uns 5 minutos' },
  { id: 'piramide', title: 'Pirâmide', detail: '62 peças · uns 8 minutos' },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Pares: escolhe o tamanho e joga. */
/** Com `signs`, as peças mostram planetas e signos em vez dos desenhos de natureza. */
export function PairsGame({ onFinish, seed, signs }: { onFinish: (o: GameOutcome) => void; seed?: number; signs?: Sign[] }) {
  const [layout, setLayout] = useState<LayoutId | null>(null);
  const [challengeSeed, setChallengeSeed] = useState<number | undefined>();
  const challenge = dailyPairsChallenge(toLocalDate(new Date()));
  if (!layout)
    return (
      <section className="intro">
        <h2>Escolha a partida</h2>
        <button
          type="button"
          className="option"
          onClick={() => {
            setLayout(challenge.layout);
            setChallengeSeed(challenge.seed);
          }}
        >
          <strong>Desafio de hoje</strong>
          <span className="small muted">Uma partida igual para você repetir, se quiser · {challenge.layout}</span>
        </button>
        <div className="stack">
          {MODES.map((m) => (
            <button key={m.id} type="button" className="option" onClick={() => setLayout(m.id)}>
              <strong>{m.title}</strong>
              <span className="small muted">{m.detail}</span>
            </button>
          ))}
        </div>
      </section>
    );
  return <PairsBoard layout={layout} seed={challengeSeed ?? seed ?? Date.now()} onFinish={onFinish} signs={signs} />;
}

function PairsBoard({ layout, seed, onFinish, signs }: { layout: LayoutId; seed: number; onFinish: (o: GameOutcome) => void; signs?: Sign[] }) {
  const rng = useMemo(() => createRng(seed), [seed]);
  const [board, setBoard] = useState<Tile[]>(() => deal(layout, rng, signs?.length));
  const nameOf = (t: Tile) => (signs ? signs[t.symbol].name : SYMBOLS[t.symbol]);
  const total = useRef(board.length);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ board: Tile[]; score: number }[]>([]);
  const lastMatch = useRef<number | null>(null);
  const start = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const done = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const free = useMemo(() => new Set(board.filter((t) => isFree(t, board)).map((t) => t.id)), [board]);
  const stuck = board.length > 0 && !findPair(board);
  const elapsed = (now - start.current) / 1000;

  const finish = (cleared: boolean, finalScore: number) => {
    if (done.current) return;
    done.current = true;
    const seconds = (Date.now() - start.current) / 1000;
    // Terminar rápido rende mais, mas terminar devagar nunca tira pontos.
    const bonus = cleared ? Math.max(0, Math.round((total.current * 6 - seconds) / 2)) : 0;
    onFinish({
      score: finalScore + bonus,
      durationMs: Date.now() - start.current,
      extra: { layout, cleared, pairs: (total.current - board.length) / 2 },
    });
  };

  const tap = (t: Tile) => {
    setHint([]);
    if (!free.has(t.id)) {
      setShake(t.id);
      vibrate(10);
      setTimeout(() => setShake(null), 300);
      return;
    }
    if (selected === null || selected === t.id) {
      setSelected(selected === t.id ? null : t.id);
      return;
    }
    const other = board.find((b) => b.id === selected)!;
    if (!canMatch(other, t, board)) {
      setSelected(t.id);
      return;
    }
    vibrate(20);
    const at = Date.now();
    const gained = pairPoints(lastMatch.current === null ? null : at - lastMatch.current);
    lastMatch.current = at;
    const next = board.filter((b) => b.id !== t.id && b.id !== other.id);
    setHistory((h) => [...h, { board, score }]);
    setBoard(next);
    setSelected(null);
    setScore((s) => s + gained);
    if (!next.length) finish(true, score + gained);
  };

  const showHint = () => {
    const pair = findPair(board);
    if (!pair) return;
    setHint(pair.map((t) => t.id));
    setScore((s) => Math.max(0, s - HINT_COST));
  };
  const doShuffle = (isFreeShuffle: boolean) => {
    setHistory((h) => [...h, { board, score }]);
    setBoard(reshuffle(board, rng));
    setSelected(null);
    setHint([]);
    if (!isFreeShuffle) setScore((s) => Math.max(0, s - SHUFFLE_COST));
  };
  const undo = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    // Desfazer devolve as peças e os pontos daquela jogada: não dá para ganhar ponto repetindo.
    setBoard(prev.board);
    setScore(prev.score);
    setSelected(null);
    lastMatch.current = null;
  };

  // Medidas: o tabuleiro tem 16 meias-peças de largura e cabe na tela.
  const maxX = Math.max(...board.map((t) => t.x), 0) + 2;
  const maxY = Math.max(...board.map((t) => t.y), 0) + 2;
  const width = Math.min(typeof window === 'undefined' ? 390 : window.innerWidth, 560) - 40;
  const u = Math.max(14, Math.min(26, width / 16));
  // Cada camada sobe e vai para a esquerda, com a lateral da peça aparecendo: dá a sensação de pilha.
  const depth = Math.round(u * 0.28);
  const ordered = [...board].sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);

  return (
    <div className={`mj${signs ? ' mj--occult' : ''}`}>
      <div className="mj__bar">
        <span>
          <strong>{score}</strong> pontos
        </span>
        <span className="muted small">
          {board.length / 2} pares · {fmt(elapsed)}
        </span>
      </div>
      <div
        className="mj__board"
        style={{
          width: maxX * u + depth * 3,
          height: maxY * u * 1.25 + depth * 3,
        }}
      >
        {ordered.map((t) => {
          const isFreeTile = free.has(t.id);
          const cls = [
            'mj__tile',
            isFreeTile ? 'mj__tile--free' : 'mj__tile--blocked',
            selected === t.id ? 'mj__tile--sel' : '',
            hint.includes(t.id) ? 'mj__tile--hint' : '',
            shake === t.id ? 'mj__tile--shake' : '',
          ].join(' ');
          return (
            <button
              key={t.id}
              type="button"
              className={cls}
              aria-label={`${nameOf(t)}${isFreeTile ? '' : ', presa'}`}
              aria-pressed={selected === t.id}
              onClick={() => tap(t)}
              style={{
                left: t.x * u + (3 - t.z) * depth,
                top: t.y * u * 1.25 + (3 - t.z) * depth,
                width: 2 * u,
                height: 2 * u * 1.25,
                fontSize: signs ? u * 1.3 : u * 1.15,
                color: signs?.[t.symbol].color,
                zIndex: t.z * 100 + t.y,
                boxShadow:
                  selected === t.id ? undefined : `${2 + t.z * 2}px ${3 + t.z * 2}px 0 var(--mj-side), ${3 + t.z * 3}px ${5 + t.z * 3}px ${6 + t.z * 3}px rgba(0, 0, 0, 0.4)`,
              }}
            >
              {signs ? <Glyph id={signs[t.symbol].id} /> : SYMBOLS[t.symbol]}
            </button>
          );
        })}
      </div>
      {stuck && (
        <div className="card mj__stuck">
          <p>Sem pares livres. Embaralhar é grátis agora.</p>
          <button type="button" className="btn" onClick={() => doShuffle(true)}>
            Embaralhar
          </button>
        </div>
      )}
      <div className="mj__tools">
        <button type="button" className="chip" onClick={showHint} disabled={stuck}>
          Dica −{HINT_COST}
        </button>
        <button type="button" className="chip" onClick={() => doShuffle(false)} disabled={stuck}>
          Embaralhar −{SHUFFLE_COST}
        </button>
        <button type="button" className="chip" onClick={undo} disabled={!history.length}>
          Desfazer
        </button>
        <button type="button" className="chip" onClick={() => finish(false, score)}>
          Terminar
        </button>
      </div>
    </div>
  );
}

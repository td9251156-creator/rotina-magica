import { useEffect, useMemo, useRef, useState } from 'react';
import { MEMORY_MODES, bestGrid, cleared, dealMemory, flip, hideOpen, memoryBonus, type MemoryMode } from '@/domain/games/memory';
import { createRng } from '@/domain/games/rng';
import { ARCANA, roman } from '@/domain/games/symbols';
import { SYMBOL_ART } from './art';
import { useFitArea } from './fit';
import { Art, Glyph } from './Glyph';
import { vibrate, type GameOutcome } from './record';

const MODES: { id: MemoryMode; title: string; detail: string }[] = [
  { id: 'curta', title: 'Partida curta', detail: '8 pares · uns 2 minutos' },
  {
    id: 'completa',
    title: 'Mesa completa',
    detail: '12 pares · uns 4 minutos',
  },
];

/** Arcanos: escolhe o tamanho e joga. */
export function ArcanaGame({ onFinish, seed }: { onFinish: (o: GameOutcome) => void; seed?: number }) {
  const [mode, setMode] = useState<MemoryMode | null>(null);
  if (!mode)
    return (
      <section className="intro">
        <h2>Escolha a mesa</h2>
        <div className="stack">
          {MODES.map((m) => (
            <button key={m.id} type="button" className="option" onClick={() => setMode(m.id)}>
              <strong>{m.title}</strong>
              <span className="small muted">{m.detail}</span>
            </button>
          ))}
        </div>
      </section>
    );
  return <ArcanaTable mode={mode} seed={seed ?? Date.now()} onFinish={onFinish} />;
}

function ArcanaTable({ mode, seed, onFinish }: { mode: MemoryMode; seed: number; onFinish: (o: GameOutcome) => void }) {
  const { pairs } = MEMORY_MODES[mode];
  const [tableRef, area] = useFitArea<HTMLDivElement>(170);
  const { columns, cardWidth } = bestGrid(pairs * 2, area.width, area.height);
  const initial = useMemo(() => dealMemory(pairs, createRng(seed)), [pairs, seed]);
  const [state, setState] = useState(initial);
  const start = useRef(Date.now());
  const done = useRef(false);

  // Duas cartas diferentes ficam à mostra um instante e se escondem.
  useEffect(() => {
    if (state.open.length !== 2) return;
    const id = setTimeout(() => setState(hideOpen), 900);
    return () => clearTimeout(id);
  }, [state.open]);

  const finish = (finalScore: number, all: boolean) => {
    if (done.current) return;
    done.current = true;
    onFinish({
      score: finalScore + (all ? memoryBonus(pairs, state.moves) : 0),
      durationMs: Date.now() - start.current,
      extra: { mode, moves: state.moves, cleared: all },
    });
  };

  useEffect(() => {
    if (!cleared(state)) return;
    const id = setTimeout(() => finish(state.score, true), 1600);
    return () => clearTimeout(id);
  }, [state]); // eslint-disable-line

  const tap = (id: number) => {
    const next = flip(state, id);
    if (next.found !== state.found) vibrate(25);
    setState(next);
  };

  const found = state.found === null ? null : ARCANA[state.found];
  const matched = state.cards.filter((c) => c.matched).length / 2;
  const wide = cardWidth >= 64;

  return (
    <div className="arc">
      <div className="mj__bar">
        <span>
          <strong>{state.score}</strong> pontos
        </span>
        <span className="muted small">
          {matched} de {pairs} pares · {state.moves} tentativas
        </span>
      </div>
      <div ref={tableRef} className="arc__fit">
      <div className="arc__table" style={{ gridTemplateColumns: `repeat(${columns}, ${cardWidth}px)`, fontSize: Math.max(13, cardWidth * 0.26) }}>
        {state.cards.map((c) => {
          const a = ARCANA[c.arcanum];
          const up = c.matched || state.open.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`arc__card${up ? ' arc__card--up' : ''}${c.matched ? ' arc__card--done' : ''}`}
              onClick={() => tap(c.id)}
              aria-label={up ? `${roman(a.n)}, ${a.name}` : 'Carta virada para baixo'}
              disabled={c.matched}
            >
              <span className="arc__inner">
                <span className="arc__back" aria-hidden="true">
                  {SYMBOL_ART.verso ? <Art id="verso" className="arc__verso" /> : '✦'}
                </span>
                <span className="arc__face" aria-hidden="true">
                  <span className="arc__num">{roman(a.n)}</span>
                  <Glyph id={a.symbol} />
                  {wide && <span className="arc__name">{a.name.replace(/^(O|A|Os) /, '')}</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      </div>
      <div className="card arc__lesson" aria-live="polite">
        {found ? (
          <>
            <span className="eyebrow">
              {roman(found.n)} · {found.name}
              {found.thoth ? ` (${found.thoth}, no Thoth)` : ''}
            </span>
            <p>{found.lesson}</p>
          </>
        ) : (
          <p className="muted small">Ache os pares. Cada arcano encontrado traz uma ideia para levar.</p>
        )}
      </div>
      <div className="mj__tools">
        <button type="button" className="chip" onClick={() => finish(state.score, false)}>
          Terminar
        </button>
      </div>
    </div>
  );
}

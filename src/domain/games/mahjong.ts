/**
 * Pares: paciência de pares no estilo Mahjong. Peças empilhadas; só se tiram pares iguais de peças
 * livres (nada em cima e um dos lados aberto). Exige atenção, memória de trabalho e planejamento,
 * e uma partida leva o tempo de uma onda de vontade passar.
 *
 * Coordenadas em meias-peças: a peça em (x, y, z) ocupa [x, x+2) × [y, y+2) na camada z.
 * Toda distribuição é montada ao contrário (tirando pares livres de um tabuleiro cheio), então
 * sempre tem solução.
 */
import { shuffle, type Rng } from './rng';
import type { LocalDate } from '../dates';

export interface Slot {
  x: number;
  y: number;
  z: number;
}

export interface Tile extends Slot {
  id: number;
  symbol: number;
}

export const SYMBOLS = ['🌙', '☀️', '⭐', '🌿', '🌊', '🔥', '🌸', '🍀', '🌻', '💧', '⛰️', '🐚', '🦋', '🍎', '🎵', '🕯️', '🍋', '🪶'] as const;

const rect = (x0: number, x1: number, y0: number, y1: number, z: number): Slot[] => {
  const out: Slot[] = [];
  for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) out.push({ x, y, z });
  return out;
};

/** Layouts que cabem na largura de um celular (8 peças). */
export const LAYOUTS = {
  /** Pirâmide: 62 peças em 3 camadas. */
  piramide: [...rect(0, 14, 0, 8, 0), ...rect(2, 12, 2, 6, 1), ...rect(4, 10, 4, 4, 2)],
  /** Partida curta: 34 peças em 3 camadas. */
  curta: [...rect(0, 10, 0, 6, 0), ...rect(2, 8, 2, 4, 1), ...rect(4, 6, 3, 3, 2)],
  /** Jardim: 44 peças em 3 camadas, entre a partida curta e a pirâmide. */
  jardim: [...rect(0, 12, 0, 6, 0), ...rect(2, 10, 2, 4, 1), ...rect(4, 8, 2, 4, 2)],
} as const satisfies Record<string, Slot[]>;

export type LayoutId = keyof typeof LAYOUTS;

export interface DailyPairsChallenge {
  layout: LayoutId;
  seed: number;
}

/** Escolhe sempre o mesmo tabuleiro no mesmo dia, sem criar uma obrigação para a pessoa. */
export function dailyPairsChallenge(date: LocalDate): DailyPairsChallenge {
  const digits = date.replaceAll('-', '');
  const seed = digits.split('').reduce((hash, digit) => (hash * 31 + Number(digit)) >>> 0, 7);
  const layouts: LayoutId[] = ['curta', 'jardim', 'piramide'];
  return { layout: layouts[seed % layouts.length], seed };
}

const overlaps = (a: Slot, b: Slot) => Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;

/** Livre: nada por cima e o lado esquerdo ou o direito vazio. */
export function isFree(t: Slot, board: readonly Slot[]): boolean {
  let left = false;
  let right = false;
  for (const o of board) {
    if (o === t) continue;
    if (o.z === t.z + 1 && overlaps(o, t)) return false;
    if (o.z === t.z && Math.abs(o.y - t.y) < 2) {
      if (o.x === t.x - 2) left = true;
      if (o.x === t.x + 2) right = true;
    }
  }
  return !left || !right;
}

/**
 * Dá símbolos às posições de forma que a partida tenha solução: tira pares de posições livres, uma
 * por vez, e dá a cada par o mesmo símbolo. Se travar, tenta de novo com outra ordem.
 */
function assign(slots: readonly Slot[], rng: Rng, kinds: number = SYMBOLS.length): number[] | null {
  for (let attempt = 0; attempt < 200; attempt++) {
    const left = slots.map((s, i) => ({ ...s, i }));
    const symbols = new Array<number>(slots.length);
    const deck = shuffle(
      Array.from({ length: slots.length / 2 }, (_, k) => k % kinds),
      rng,
    );
    let ok = true;
    for (const symbol of deck) {
      const free = shuffle(
        left.filter((s) => isFree(s, left)),
        rng,
      );
      if (free.length < 2) {
        ok = false;
        break;
      }
      const [a, b] = free;
      symbols[a.i] = symbol;
      symbols[b.i] = symbol;
      left.splice(left.indexOf(a), 1);
      left.splice(left.indexOf(b), 1);
    }
    if (ok) return symbols;
  }
  return null;
}

/** `kinds`: quantos símbolos diferentes o tema tem. */
export function deal(layout: LayoutId, rng: Rng, kinds: number = SYMBOLS.length): Tile[] {
  const slots = LAYOUTS[layout];
  const symbols = assign(slots, rng, kinds);
  if (!symbols) throw new Error('layout sem solução');
  return slots.map((s, id) => ({ ...s, id, symbol: symbols[id] }));
}

export function canMatch(a: Tile, b: Tile, board: readonly Tile[]): boolean {
  return a.id !== b.id && a.symbol === b.symbol && isFree(a, board) && isFree(b, board);
}

/** Um par que dá para tirar agora (para a dica), ou null se não há jogada. */
export function findPair(board: readonly Tile[]): [Tile, Tile] | null {
  const free = board.filter((t) => isFree(t, board));
  for (let i = 0; i < free.length; i++)
    for (let j = i + 1; j < free.length; j++) if (free[i].symbol === free[j].symbol) return [free[i], free[j]];
  return null;
}

/** Embaralha as peças que sobraram, mantendo as posições, de um jeito que ainda tenha solução. */
export function reshuffle(board: readonly Tile[], rng: Rng): Tile[] {
  const pool = shuffle(
    board.map((t) => t.symbol),
    rng,
  );
  // Reaproveita os mesmos símbolos: monta de novo os pares a partir das posições.
  const pairs: number[] = [];
  const counts = new Map<number, number>();
  pool.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
  counts.forEach((n, s) => {
    for (let k = 0; k < n / 2; k++) pairs.push(s);
  });
  for (let attempt = 0; attempt < 200; attempt++) {
    const order = shuffle(pairs, rng);
    const left = board.map((t) => ({ ...t }));
    const out = new Map<number, number>();
    let ok = true;
    for (const symbol of order) {
      const free = shuffle(
        left.filter((s) => isFree(s, left)),
        rng,
      );
      if (free.length < 2) {
        ok = false;
        break;
      }
      out.set(free[0].id, symbol);
      out.set(free[1].id, symbol);
      left.splice(left.indexOf(free[0]), 1);
      left.splice(left.indexOf(free[1]), 1);
    }
    if (ok) return board.map((t) => ({ ...t, symbol: out.get(t.id)! }));
  }
  // Travou pelas posições (ex.: duas peças empilhadas): espalha o que sobrou numa camada só.
  if (board.some((t) => t.z > 0)) {
    const flat = board.map((t, k) => ({ ...t, x: (k % 8) * 2, y: Math.floor(k / 8) * 2, z: 0 }));
    return reshuffle(flat, rng);
  }
  return [...board];
}

/** Pontos de um par: base + bônus por tirar rápido em sequência. */
export function pairPoints(msSinceLastMatch: number | null): number {
  if (msSinceLastMatch !== null && msSinceLastMatch < 4000) return 15;
  return 10;
}

export const HINT_COST = 15;
export const SHUFFLE_COST = 25;

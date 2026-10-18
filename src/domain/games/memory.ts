/**
 * Arcanos: jogo da memória com os Arcanos Maiores. Lembrar onde está cada carta ocupa a memória de
 * trabalho, o mesmo espaço que a vontade usa para montar suas imagens (Kavanagh, teoria da
 * intrusão elaborada); por isso jogos assim baixam a força da fissura.
 */
import { ARCANA } from './symbols';
import { shuffle, type Rng } from './rng';

export interface MemoryCard {
  id: number;
  /** Número do arcano (0 a 21). */
  arcanum: number;
  matched: boolean;
}

export interface MemoryState {
  cards: MemoryCard[];
  /** Cartas viradas agora (no máximo duas). */
  open: number[];
  /** Tentativas: cada par de cartas viradas conta uma. */
  moves: number;
  streak: number;
  score: number;
  /** Último arcano achado, para mostrar a ideia dele. */
  found: number | null;
}

export const MEMORY_MODES = {
  curta: { pairs: 8, columns: 4 },
  completa: { pairs: 12, columns: 6 },
} as const;
export type MemoryMode = keyof typeof MEMORY_MODES;

export function dealMemory(pairs: number, rng: Rng): MemoryState {
  const chosen = shuffle(
    ARCANA.map((a) => a.n),
    rng,
  ).slice(0, pairs);
  const cards = shuffle([...chosen, ...chosen], rng).map((arcanum, id) => ({
    id,
    arcanum,
    matched: false,
  }));
  return { cards, open: [], moves: 0, streak: 0, score: 0, found: null };
}

/** Pontos de um par: 20, mais 10 por par seguido sem errar. */
export function matchPoints(streak: number): number {
  return 20 + 10 * streak;
}

/** Vira uma carta. Se já havia duas viradas sem par, elas se escondem antes. */
export function flip(s: MemoryState, id: number): MemoryState {
  const base = s.open.length === 2 ? { ...s, open: [] } : s;
  const card = base.cards.find((c) => c.id === id);
  if (!card || card.matched || base.open.includes(id)) return base;
  const open = [...base.open, id];
  if (open.length < 2) return { ...base, open };
  const [a, b] = open.map((o) => base.cards.find((c) => c.id === o)!);
  const moves = base.moves + 1;
  if (a.arcanum !== b.arcanum) return { ...base, open, moves, streak: 0 };
  return {
    ...base,
    cards: base.cards.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)),
    open: [],
    moves,
    streak: base.streak + 1,
    score: base.score + matchPoints(base.streak),
    found: a.arcanum,
  };
}

export function hideOpen(s: MemoryState): MemoryState {
  return s.open.length === 2 ? { ...s, open: [] } : s;
}

export function cleared(s: MemoryState): boolean {
  return s.cards.every((c) => c.matched);
}

/** Bônus por terminar com poucas tentativas. Errar muito nunca tira pontos. */
export function memoryBonus(pairs: number, moves: number): number {
  return Math.max(0, pairs * 2 - moves) * 10;
}

/**
 * Grade que deixa as cartas do maior tamanho possível no espaço livre (largura × altura),
 * com cartas na proporção 3:4. Devolve colunas e a largura de cada carta.
 */
export function bestGrid(cards: number, width: number, height: number, gap = 8): { columns: number; cardWidth: number } {
  let best = { columns: 4, cardWidth: 0 };
  for (let columns = 3; columns <= 6; columns++) {
    const rows = Math.ceil(cards / columns);
    const byWidth = (width - gap * (columns - 1)) / columns;
    const byHeight = ((height - gap * (rows - 1)) / rows) * 0.75;
    const cardWidth = Math.floor(Math.min(byWidth, byHeight));
    if (cardWidth > best.cardWidth) best = { columns, cardWidth };
  }
  return best;
}

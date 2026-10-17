/**
 * Blocos: jogo de encaixe no estilo Tetris. Estudos de Skorka-Brown, Andrade e May (2014, 2015)
 * mostraram que 3 minutos de Tetris reduzem a força da fissura (inclusive por drogas) em cerca de
 * 20%: o jogo ocupa a mesma "tela mental" onde a vontade monta suas imagens.
 * Motor puro, sem React: estado entra, estado sai.
 */
import { createRng, shuffle, type Rng } from './rng';

export const ROWS = 20;
export const COLS = 10;
export type Board = number[][];
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

const SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};
const TYPES = Object.keys(SHAPES) as PieceType[];
export const COLOR_INDEX: Record<PieceType, number> = { I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7 };

export interface Piece {
  type: PieceType;
  shape: number[][];
  x: number;
  y: number;
}

/** O que a última peça fez ao travar, para a tela comemorar. */
export interface ClearEvent {
  lines: number;
  points: number;
  /** Peças seguidas que limparam linha (0 = a primeira da sequência). */
  combo: number;
  /** Quatro linhas de uma vez logo depois de outras quatro. */
  backToBack: boolean;
}

export interface BlocksState {
  board: Board;
  piece: Piece;
  /** As próximas peças, na ordem (a primeira é a que vem já). */
  next: PieceType[];
  bag: PieceType[];
  /** Peça guardada para depois; dá para trocar uma vez por peça. */
  hold: PieceType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  /** Sequência atual de peças que limparam linha; -1 quando não há. */
  combo: number;
  /** A última limpeza foi de quatro linhas (vale bônus se vier outra). */
  lastWasTetris: boolean;
  /** Conta as peças travadas: muda a cada trava, para a tela saber quando mostrar `lastClear`. */
  locks: number;
  lastClear: ClearEvent | null;
  /** Quantas vezes o tabuleiro encheu. No modo SOS o jogo recomeça sozinho em vez de acabar. */
  toppedOut: number;
  over: boolean;
  seed: number;
}

export function emptyBoard(rows = ROWS, cols = COLS): Board {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export function rotate(shape: number[][]): number[][] {
  const n = shape.length;
  return shape.map((row, y) => row.map((_, x) => shape[n - 1 - x][y]));
}

export function cells(p: Piece): [number, number][] {
  const out: [number, number][] = [];
  p.shape.forEach((row, dy) => row.forEach((v, dx) => v && out.push([p.x + dx, p.y + dy])));
  return out;
}

export function collides(board: Board, p: Piece): boolean {
  return cells(p).some(([x, y]) => x < 0 || x >= board[0].length || y >= board.length || (y >= 0 && board[y][x] !== 0));
}

function spawn(type: PieceType, cols: number): Piece {
  const shape = SHAPES[type].map((r) => [...r]);
  return { type, shape, x: Math.floor((cols - shape.length) / 2), y: type === 'I' ? -1 : 0 };
}

function takeNext(bag: PieceType[], rng: Rng): { type: PieceType; bag: PieceType[] } {
  const filled = bag.length ? bag : shuffle(TYPES, rng);
  return { type: filled[0], bag: filled.slice(1) };
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((v) => v === 0));
  const cleared = board.length - kept.length;
  const fresh = Array.from({ length: cleared }, () => new Array(board[0].length).fill(0));
  return { board: [...fresh, ...kept], cleared };
}

const LINE_POINTS = [0, 100, 300, 500, 800];
export const PREVIEW = 3;
const COMBO_POINTS = 50;

export function gravityMs(level: number): number {
  return Math.max(120, 800 - (level - 1) * 65);
}

function fillQueue(queue: PieceType[], bag: PieceType[], rng: Rng): { queue: PieceType[]; bag: PieceType[] } {
  const out = [...queue];
  let rest = bag;
  while (out.length < PREVIEW) {
    const t = takeNext(rest, rng);
    out.push(t.type);
    rest = t.bag;
  }
  return { queue: out, bag: rest };
}

export function newGame(seed: number): BlocksState {
  const rng = createRng(seed);
  const first = takeNext([], rng);
  const { queue, bag } = fillQueue([], first.bag, rng);
  return {
    board: emptyBoard(),
    piece: spawn(first.type, COLS),
    next: queue,
    bag,
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    combo: -1,
    lastWasTetris: false,
    locks: 0,
    lastClear: null,
    toppedOut: 0,
    over: false,
    seed: Math.floor(rng() * 2 ** 31),
  };
}

export function move(s: BlocksState, dx: number): BlocksState {
  const piece = { ...s.piece, x: s.piece.x + dx };
  return s.over || collides(s.board, piece) ? s : { ...s, piece };
}

export function rotatePiece(s: BlocksState): BlocksState {
  if (s.over) return s;
  const shape = rotate(s.piece.shape);
  // Pequenos "chutes" na parede para a rotação não travar encostada na borda.
  for (const kick of [0, -1, 1, -2, 2]) {
    const piece = { ...s.piece, shape, x: s.piece.x + kick };
    if (!collides(s.board, piece)) return { ...s, piece };
  }
  return s;
}

/** Pontos de uma limpeza: linhas × nível, mais bônus por sequência e por quatro linhas seguidas. */
export function clearPoints(cleared: number, level: number, combo: number, backToBack: boolean): number {
  if (!cleared) return 0;
  const base = LINE_POINTS[cleared] * level;
  return (backToBack ? Math.round(base * 1.5) : base) + COMBO_POINTS * Math.max(0, combo) * level;
}

function lock(s: BlocksState, endless: boolean): BlocksState {
  const board = s.board.map((r) => [...r]);
  let toppedOut = s.toppedOut;
  for (const [x, y] of cells(s.piece)) {
    if (y < 0) toppedOut = -1;
    else board[y][x] = COLOR_INDEX[s.piece.type];
  }
  const { board: clearedBoard, cleared } = clearLines(board);
  const lines = s.lines + cleared;
  const level = 1 + Math.floor(lines / 10);
  const combo = cleared ? s.combo + 1 : -1;
  const backToBack = cleared === 4 && s.lastWasTetris;
  const points = clearPoints(cleared, s.level, combo, backToBack);
  const rng = createRng(s.seed);
  const [nextType, ...rest] = s.next;
  const { queue, bag } = fillQueue(rest, s.bag, rng);
  const piece = spawn(nextType, COLS);
  let finalBoard = clearedBoard;
  let over = false;
  if (toppedOut === -1 || collides(clearedBoard, piece)) {
    toppedOut = s.toppedOut + 1;
    // No modo SOS o tabuleiro esvazia e o jogo segue; fora dele, a partida acaba.
    if (endless) finalBoard = emptyBoard();
    else over = true;
  }
  return {
    ...s,
    board: finalBoard,
    piece,
    next: queue,
    bag,
    canHold: true,
    lines,
    level,
    score: s.score + points,
    combo,
    lastWasTetris: cleared ? cleared === 4 : s.lastWasTetris,
    locks: s.locks + 1,
    lastClear: cleared ? { lines: cleared, points, combo, backToBack } : null,
    toppedOut,
    over,
    seed: Math.floor(rng() * 2 ** 31),
  };
}

/** Guarda a peça atual (ou troca pela guardada). Uma vez por peça, para não virar fuga infinita. */
export function holdPiece(s: BlocksState): BlocksState {
  if (s.over || !s.canHold) return s;
  if (s.hold !== null && collides(s.board, spawn(s.hold, COLS))) return s;
  if (s.hold === null) {
    const rng = createRng(s.seed);
    const [nextType, ...rest] = s.next;
    const { queue, bag } = fillQueue(rest, s.bag, rng);
    return { ...s, hold: s.piece.type, piece: spawn(nextType, COLS), next: queue, bag, canHold: false, seed: Math.floor(rng() * 2 ** 31) };
  }
  return { ...s, hold: s.piece.type, piece: spawn(s.hold, COLS), canHold: false };
}

/** A peça está apoiada (a próxima descida trava). */
export function grounded(s: BlocksState): boolean {
  return collides(s.board, { ...s.piece, y: s.piece.y + 1 });
}

/** Um passo de gravidade: desce uma linha ou trava a peça. */
export function tick(s: BlocksState, endless = false): BlocksState {
  if (s.over) return s;
  const piece = { ...s.piece, y: s.piece.y + 1 };
  return collides(s.board, piece) ? lock(s, endless) : { ...s, piece };
}

/** Descer na mão vale 1 ponto por linha. */
export function softDrop(s: BlocksState, endless = false): BlocksState {
  if (s.over) return s;
  return grounded(s) ? lock(s, endless) : { ...s, piece: { ...s.piece, y: s.piece.y + 1 }, score: s.score + 1 };
}

export function hardDrop(s: BlocksState, endless = false): BlocksState {
  if (s.over) return s;
  let piece = s.piece;
  let dropped = 0;
  while (!collides(s.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 };
    dropped++;
  }
  return lock({ ...s, piece, score: s.score + dropped * 2 }, endless);
}

/** Onde a peça cairia (sombra). */
export function ghost(s: BlocksState): Piece {
  let piece = s.piece;
  while (!collides(s.board, { ...piece, y: piece.y + 1 })) piece = { ...piece, y: piece.y + 1 };
  return piece;
}

export { SHAPES };

import { LAYOUTS, canMatch, deal, findPair, isFree, reshuffle, type LayoutId, type Tile } from './mahjong';
import { createRng } from './rng';

/** Joga sozinho, sempre tirando o primeiro par livre; embaralha quando trava. */
function autoplay(board: Tile[], seed: number): { cleared: boolean; shuffles: number } {
  const rng = createRng(seed);
  let shuffles = 0;
  while (board.length) {
    const pair = findPair(board);
    if (!pair) {
      if (++shuffles > 20) return { cleared: false, shuffles };
      board = reshuffle(board, rng);
      continue;
    }
    board = board.filter((t) => t.id !== pair[0].id && t.id !== pair[1].id);
  }
  return { cleared: true, shuffles };
}

describe('Pares (estilo Mahjong)', () => {
  it('os layouts têm número par de peças e sem posições repetidas', () => {
    (Object.keys(LAYOUTS) as LayoutId[]).forEach((id) => {
      const slots = LAYOUTS[id];
      expect(slots.length % 2).toBe(0);
      expect(new Set(slots.map((s) => `${s.x},${s.y},${s.z}`)).size).toBe(slots.length);
    });
  });

  it('cada símbolo aparece um número par de vezes', () => {
    const board = deal('piramide', createRng(1));
    const counts = new Map<number, number>();
    board.forEach((t) => counts.set(t.symbol, (counts.get(t.symbol) ?? 0) + 1));
    counts.forEach((n) => expect(n % 2).toBe(0));
  });

  it('peça coberta ou presa dos dois lados não está livre', () => {
    const board = deal('piramide', createRng(2));
    const top = board.find((t) => t.z === 2)!;
    const under = board.find((t) => t.z === 0 && t.x === top.x && t.y === top.y)!;
    expect(isFree(top, board)).toBe(true);
    expect(isFree(under, board)).toBe(false);
    const middle = board.find((t) => t.z === 0 && t.x === 6 && t.y === 0)!;
    expect(isFree(middle, board)).toBe(false);
    const corner = board.find((t) => t.z === 0 && t.x === 0 && t.y === 0)!;
    expect(isFree(corner, board)).toBe(true);
  });

  it('só combina pares iguais e livres', () => {
    const board = deal('curta', createRng(3));
    const [a, b] = findPair(board)!;
    expect(canMatch(a, b, board)).toBe(true);
    expect(canMatch(a, a, board)).toBe(false);
  });

  it('sempre dá para terminar (com embaralhar quando travar)', () => {
    for (let seed = 1; seed <= 15; seed++) {
      expect(autoplay(deal('piramide', createRng(seed)), seed).cleared).toBe(true);
      expect(autoplay(deal('curta', createRng(seed)), seed).cleared).toBe(true);
    }
  });

  it('embaralhar mantém as posições e os símbolos', () => {
    const board = deal('curta', createRng(4)).slice(0, 20);
    const after = reshuffle(board, createRng(5));
    expect(after.map((t) => t.id)).toEqual(board.map((t) => t.id));
    expect(after.map((t) => t.symbol).sort()).toEqual(board.map((t) => t.symbol).sort());
  });
});

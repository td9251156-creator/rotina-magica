import { bestGrid, cleared, dealMemory, flip, hideOpen, matchPoints, memoryBonus } from './memory';
import { createRng } from './rng';
import { ARCANA, OCCULT_SIGNS, SEPHIROTH, roman, sephirah, symbolsOn } from './symbols';

describe('símbolos', () => {
  it('seguem a rotina, a não ser que a pessoa escolha', () => {
    expect(symbolsOn(null, 'magica')).toBe(true);
    expect(symbolsOn(null, 'simples')).toBe(false);
    expect(symbolsOn(null, null)).toBe(false);
    expect(symbolsOn(false, 'magica')).toBe(false);
    expect(symbolsOn(true, 'simples')).toBe(true);
  });

  it('têm 22 arcanos, 7 planetas e 12 signos, sem repetir', () => {
    expect(ARCANA.map((a) => a.n)).toEqual(Array.from({ length: 22 }, (_, i) => i));
    expect(new Set(OCCULT_SIGNS.map((s) => s.glyph)).size).toBe(19);
    ARCANA.forEach((a) => expect(a.lesson.split(' ').length).toBeLessThanOrEqual(12));
  });

  it('o Blocos sobe a Árvore da Vida e fica na Coroa', () => {
    expect(sephirah(1).name).toBe('Malkuth');
    expect(sephirah(10).name).toBe('Kether');
    expect(sephirah(14)).toBe(SEPHIROTH[9]);
  });

  it('escreve números romanos', () => {
    expect([0, 4, 9, 14, 19, 21].map(roman)).toEqual(['0', 'IV', 'IX', 'XIV', 'XIX', 'XXI']);
  });
});

describe('Arcanos (memória)', () => {
  it('distribui cada carta duas vezes', () => {
    const s = dealMemory(8, createRng(1));
    expect(s.cards).toHaveLength(16);
    const counts = new Map<number, number>();
    s.cards.forEach((c) => counts.set(c.arcanum, (counts.get(c.arcanum) ?? 0) + 1));
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
  });

  it('acha par, conta tentativas e sequência', () => {
    let s = dealMemory(8, createRng(2));
    const [a, b] = s.cards.filter((c) => c.arcanum === s.cards[0].arcanum);
    const other = s.cards.find((c) => c.arcanum !== a.arcanum)!;
    s = flip(s, a.id);
    s = flip(s, other.id);
    expect(s.open).toHaveLength(2);
    expect(s.moves).toBe(1);
    s = hideOpen(s);
    s = flip(flip(s, a.id), b.id);
    expect(s.found).toBe(a.arcanum);
    expect(s.score).toBe(matchPoints(0));
    expect(s.moves).toBe(2);
    expect(flip(s, a.id)).toEqual(s);
  });

  it('jogando com memória perfeita, termina com o bônus máximo', () => {
    let s = dealMemory(12, createRng(3));
    const seen = new Map<number, number>();
    s.cards.forEach((c) => {
      if (seen.has(c.arcanum)) s = flip(flip(s, seen.get(c.arcanum)!), c.id);
      else seen.set(c.arcanum, c.id);
    });
    expect(cleared(s)).toBe(true);
    expect(s.moves).toBe(12);
    expect(memoryBonus(12, s.moves)).toBe(120);
    expect(memoryBonus(12, 40)).toBe(0);
  });
});

describe('grade das cartas', () => {
  it('no celular em pé, prefere menos colunas e cartas maiores', () => {
    const g = bestGrid(24, 358, 560);
    expect(g.columns).toBeLessThan(6);
    expect(g.cardWidth).toBeGreaterThan(54);
  });
  it('na tela deitada, usa mais colunas', () => {
    expect(bestGrid(24, 900, 300).columns).toBe(6);
  });
});

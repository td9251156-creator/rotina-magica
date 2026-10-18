import { CYCLES, scoreCycle, waveHeight } from './wave';
import { bestScore, gameOfTheDay, gameTitle, levelFor, totalXp, trainedDays, xpForGame } from '../progression';

describe('Segura a onda', () => {
  it('ritmo perfeito vale 100 e baixa a onda até zero', () => {
    const perfect = scoreCycle(6000, 6000);
    expect(perfect.points).toBe(100);
    expect(waveHeight(new Array(CYCLES).fill(perfect))).toBe(0);
  });

  it('dá dica específica quando sai do ritmo', () => {
    expect(scoreCycle(2000, 6000).tip).toMatch(/Segure/);
    expect(scoreCycle(6000, 2000).tip).toMatch(/devagar/);
    expect(scoreCycle(2000, 6000).points).toBeLessThan(100);
  });
});

describe('evolução', () => {
  it('XP só cresce e define o nível', () => {
    expect(levelFor(0)).toMatchObject({ level: 1, name: 'Começo' });
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(299).level).toBe(2);
    expect(levelFor(300)).toMatchObject({ level: 3, into: 0, needed: 300 });
  });

  it('XP por jogo tem piso e teto', () => {
    expect(xpForGame('pares', 0)).toBe(10);
    expect(xpForGame('pares', 100000)).toBe(120);
  });

  it('soma XP, recordes e dias treinados', () => {
    const s = [
      { gameId: 'pares', date: '2026-10-16', score: 300, xp: 38 },
      { gameId: 'pares', date: '2026-10-16', score: 500, xp: 63 },
      { gameId: 'onda', date: '2026-10-17', score: 400, xp: 67 },
    ];
    expect(totalXp(s, 2)).toBe(38 + 63 + 67 + 80);
    expect(bestScore(s, 'pares')).toBe(500);
    expect(trainedDays(s.map((x) => x.date))).toBe(2);
  });

  it('jogo do dia reveza entre os treinos', () => {
    const days = ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'].map((d) => gameOfTheDay(d, '2026-10-16'));
    expect(days).toEqual(['pares', 'onda', 'noite', 'pares', 'onda']);
  });
});

describe('jogos que saíram', () => {
  it('mantêm o nome no histórico e o XP já ganho', () => {
    expect(gameTitle('rebate')).toBe('Rebate');
    expect(gameTitle('pares')).toBe('Pares');
    expect(totalXp([{ gameId: 'desvia', date: '2026-10-16', score: 300, xp: 38 }], 0)).toBe(38);
  });
});

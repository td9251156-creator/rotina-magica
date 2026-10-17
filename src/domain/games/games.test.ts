import { createRng } from './rng';
import { ROUND_SIZE, answer, buildDeck, cardTimeMs, correctDirection, initialSwipe } from './swipe';
import { buildRound, scoreAnswer, THOUGHTS } from './rebate';
import { CYCLES, scoreCycle, waveHeight } from './wave';
import { bestScore, gameOfTheDay, levelFor, totalXp, trainedDays, xpForGame } from '../progression';

describe('Desvia', () => {
  it('baralho equilibrado, com as palavras da pessoa', () => {
    const deck = buildDeck(createRng(1), ['Ver minha filha']);
    expect(deck).toHaveLength(ROUND_SIZE);
    expect(deck.filter((c) => c.kind === 'risco')).toHaveLength(ROUND_SIZE / 2);
    expect(buildDeck(createRng(2), ['Ver minha filha'], 200).some((c) => c.text === 'Ver minha filha')).toBe(true);
  });

  it('não usa palavra pessoal que parece gatilho', () => {
    expect(buildDeck(createRng(5), ['Dinheiro'], 200).some((c) => c.text === 'Dinheiro')).toBe(false);
  });

  it('empurra risco, puxa o que é bom; combo multiplica, erro zera o combo', () => {
    expect(correctDirection({ text: 'Só hoje', kind: 'risco' })).toBe('empurrar');
    let s = initialSwipe;
    for (let i = 0; i < 5; i++) s = answer(s, { text: 'x', kind: 'bom' }, 'puxar', 2000);
    expect(s.combo).toBe(5);
    const before = s.score;
    s = answer(s, { text: 'x', kind: 'bom' }, 'puxar', 0);
    expect(s.score - before).toBe(40);
    s = answer(s, { text: 'y', kind: 'risco' }, null, 0);
    expect(s).toMatchObject({ combo: 0, misses: 1, bestCombo: 6 });
  });

  it('o tempo por carta aperta mas tem limite', () => {
    expect(cardTimeMs(0)).toBeGreaterThan(cardTimeMs(20));
    expect(cardTimeMs(1000)).toBe(900);
  });
});

describe('Rebate', () => {
  it('cada pergunta tem a resposta certa entre 3 opções', () => {
    const round = buildRound(createRng(3));
    expect(round).toHaveLength(6);
    round.forEach((q) => {
      expect(q.options).toHaveLength(3);
      expect(q.options).toContain(q.correct);
    });
  });

  it('a resposta escrita pela pessoa vira a certa', () => {
    const round = buildRound(createRng(4), { [THOUGHTS[0].text]: 'Minha resposta' }, THOUGHTS.length);
    expect(round.find((q) => q.thought === THOUGHTS[0].text)?.correct).toBe('Minha resposta');
  });

  it('evita alternativa duplicada quando a resposta pessoal coincide com uma armadilha', () => {
    const round = buildRound(createRng(4), { [THOUGHTS[0].text]: THOUGHTS[0].traps[0] }, THOUGHTS.length);
    const question = round.find((q) => q.thought === THOUGHTS[0].text)!;
    expect(question.options).toHaveLength(3);
    expect(new Set(question.options).size).toBe(3);
    expect(question.options).toContain(question.correct);
  });

  it('pontua acerto com bônus de tempo e sequência', () => {
    expect(scoreAnswer(false, 8000, 3)).toBe(0);
    expect(scoreAnswer(true, 8000, 0)).toBe(150);
    expect(scoreAnswer(true, 0, 10)).toBe(150);
  });
});

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
    expect(xpForGame('desvia', 0)).toBe(10);
    expect(xpForGame('desvia', 100000)).toBe(120);
  });

  it('soma XP, recordes e dias treinados', () => {
    const s = [
      { gameId: 'desvia', date: '2026-10-16', score: 300, xp: 38 },
      { gameId: 'desvia', date: '2026-10-16', score: 500, xp: 63 },
      { gameId: 'onda', date: '2026-10-17', score: 400, xp: 67 },
    ];
    expect(totalXp(s, 2)).toBe(38 + 63 + 67 + 80);
    expect(bestScore(s, 'desvia')).toBe(500);
    expect(trainedDays(s.map((x) => x.date))).toBe(2);
  });

  it('jogo do dia reveza entre os treinos', () => {
    const days = ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'].map((d) => gameOfTheDay(d, '2026-10-16'));
    expect(days).toEqual(['desvia', 'rebate', 'onda', 'noite', 'desvia']);
  });
});

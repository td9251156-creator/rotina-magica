import { addDays } from './dates';
import { CHALLENGES, challengeFor, challengeProgress, nextChallenge, weekDays, weekStart, type WeekInput } from './challenges';

const empty: WeekInput = { routine: Array.from({ length: 7 }, () => []), games: [], practices: [], thoughts: 0, journalDays: 0 };

describe('Desafio da semana', () => {
  it('a semana vai de segunda a domingo', () => {
    expect(weekStart('2026-10-18')).toBe('2026-10-12'); // domingo
    expect(weekStart('2026-10-12')).toBe('2026-10-12'); // segunda
    expect(weekDays('2026-10-14')).toEqual(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  });

  it('gira um desafio por semana e vale a semana inteira', () => {
    const a = challengeFor('2026-10-12', null);
    expect(challengeFor('2026-10-18', null)).toBe(a);
    expect(challengeFor('2026-10-19', null)).not.toBe(a);
    const ids = new Set(Array.from({ length: CHALLENGES.length }, (_, i) => challengeFor(addDays('2026-11-02', i * 7), null).id));
    expect(ids.size).toBe(CHALLENGES.length);
  });

  it('respeita a troca só na semana em que foi feita', () => {
    const chosen = { week: '2026-10-12', id: 'pensamentos' };
    expect(challengeFor('2026-10-15', chosen).id).toBe('pensamentos');
    expect(challengeFor('2026-10-20', chosen).id).toBe(challengeFor('2026-10-20', null).id);
    expect(nextChallenge(CHALLENGES[CHALLENGES.length - 1])).toBe(CHALLENGES[0]);
  });

  it('conta a prática da semana sem passar da meta', () => {
    const find = (id: string) => CHALLENGES.find((c) => c.id === id)!;
    const morning = { ...empty, routine: [['m_ra'], ['n_diario'], ['m_rmp', 'm_juramento'], [], ['m_asana'], [], []] };
    expect(challengeProgress(find('manha'), morning)).toEqual({ count: 3, done: false });
    const games = { ...empty, games: [{ gameId: 'blocos' }, { gameId: 'blocos' }, { gameId: 'pares' }, { gameId: 'noite' }, { gameId: 'noite' }] };
    expect(challengeProgress(find('jogos'), games)).toEqual({ count: 3, done: true });
    expect(challengeProgress(find('ensaio'), games)).toEqual({ count: 2, done: true });
    expect(challengeProgress(find('diario'), { ...empty, journalDays: 6 })).toEqual({ count: 4, done: true });
    expect(challengeProgress(find('pensamentos'), empty)).toEqual({ count: 0, done: false });
  });

  it('todo desafio mede prática e diz onde começar', () => {
    for (const c of CHALLENGES) {
      expect(c.goal).toBeGreaterThan(0);
      expect(c.start.label.length).toBeGreaterThan(3);
      expect(`${c.title} ${c.task} ${c.why}`).not.toMatch(/sem usar|limpo|abstin|falh/i);
    }
  });
});

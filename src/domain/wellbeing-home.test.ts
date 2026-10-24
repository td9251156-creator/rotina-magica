import { findTechnique } from './training';
import { GENERAL_TECHNIQUES } from './wellbeing-techniques';
import { careForMood, careWeek, isBedtime, MOODS } from './wellbeing-home';

describe('cuidado pelo humor', () => {
  it('sugere uma vivência geral existente para cada humor', () => {
    const general = new Set(GENERAL_TECHNIQUES.map((t) => t.id));
    MOODS.forEach((_, i) => {
      const care = careForMood(i + 1);
      expect(general.has(care.techniqueId)).toBe(true);
      expect(findTechnique(care.techniqueId)).toBeDefined();
    });
  });
});

describe('semana de cuidados', () => {
  it('mostra os últimos sete dias terminando hoje, sem zerar por um dia vazio', () => {
    const week = careWeek('2026-10-24', ['2026-10-18', '2026-10-20', '2026-10-24', '2026-10-01']);
    expect(week.map((d) => d.date)).toEqual(['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24']);
    expect(week.map((d) => d.cared)).toEqual([true, false, true, false, false, false, true]);
  });
});

it('hora de dormir vai das 21h às 4h', () => {
  expect(isBedtime(new Date(2026, 9, 24, 20, 59))).toBe(false);
  expect(isBedtime(new Date(2026, 9, 24, 21, 0))).toBe(true);
  expect(isBedtime(new Date(2026, 9, 25, 3, 59))).toBe(true);
  expect(isBedtime(new Date(2026, 9, 25, 4, 0))).toBe(false);
});

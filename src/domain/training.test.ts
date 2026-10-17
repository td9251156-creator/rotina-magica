import { addDays } from './dates';
import { TECHNIQUES, findTechnique, techniqueOfTheDay } from './training';

describe('treino diário', () => {
  it('começa pelas técnicas nunca praticadas, na ordem do catálogo', () => {
    expect(techniqueOfTheDay('2026-10-16', []).id).toBe(TECHNIQUES[0].id);
    expect(techniqueOfTheDay('2026-10-16', [TECHNIQUES[0].id]).id).toBe(TECHNIQUES[1].id);
  });

  it('depois de praticar todas, reveza pelo dia', () => {
    const all = TECHNIQUES.map((t) => t.id);
    const a = techniqueOfTheDay('2026-10-16', all, '2026-10-16');
    const b = techniqueOfTheDay('2026-10-17', all, '2026-10-16');
    expect(a.id).toBe(TECHNIQUES[0].id);
    expect(b.id).toBe(TECHNIQUES[1].id);
    expect(techniqueOfTheDay(addDays('2026-10-16', TECHNIQUES.length), all, '2026-10-16').id).toBe(a.id);
  });

  it('toda técnica tem passos e ids únicos', () => {
    expect(new Set(TECHNIQUES.map((t) => t.id)).size).toBe(TECHNIQUES.length);
    TECHNIQUES.forEach((t) => expect(t.steps.length).toBeGreaterThan(0));
    expect(findTechnique('filme')?.title).toBe('O filme até o fim');
  });
});

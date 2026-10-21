import { addDays } from './dates';
import { TECHNIQUES, findTechnique, latestHarderTechniqueIds, rulerHistory, techniqueOfTheDay } from './training';
import { GENERAL_TECHNIQUES } from './wellbeing-techniques';

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

  it('evita recomendar práticas marcadas como mais difíceis, mantendo alternativas', () => {
    const allGeneral = GENERAL_TECHNIQUES.map((t) => t.id);
    expect(techniqueOfTheDay('2026-10-16', [], '2026-10-16', 'general', undefined, [allGeneral[0]]).id).toBe(allGeneral[1]);
    expect(techniqueOfTheDay('2026-10-16', [], '2026-10-16', 'general', undefined, allGeneral).id).toBe(allGeneral[0]);
  });

  it('reabilita uma vivência quando chega um feedback mais recente', () => {
    expect(latestHarderTechniqueIds([
      { techniqueId: 'pausa_corpo', feedback: 'harder' },
      { techniqueId: 'sem_resposta' },
      { techniqueId: 'pausa_corpo', feedback: 'helped' },
      { techniqueId: 'pensamento_distante', feedback: 'harder' },
    ])).toEqual(['pensamento_distante']);
  });

  it('toda técnica tem passos e ids únicos', () => {
    expect(new Set(TECHNIQUES.map((t) => t.id)).size).toBe(TECHNIQUES.length);
    TECHNIQUES.forEach((t) => expect(t.steps.length).toBeGreaterThan(0));
    expect(findTechnique('filme')?.title).toBe('Pensar o filme até o fim');
  });
});

describe('régua de 0 a 10', () => {
  it('guarda importância e confiança e ignora registros sem nota', () => {
    const regua = findTechnique('regua')!;
    expect(regua.steps.filter((s) => s.score).map((s) => s.score)).toEqual(['importancia', 'confianca']);
    const history = rulerHistory([
      { techniqueId: 'regua', date: '2026-10-01' },
      { techniqueId: 'regua', date: '2026-10-02', scores: { importancia: 8, confianca: 4 } },
      { techniqueId: 'filme', date: '2026-10-03', scores: { importancia: 1 } },
      { techniqueId: 'regua', date: '2026-10-09', scores: { confianca: 6 } },
    ]);
    expect(history).toEqual([
      { date: '2026-10-02', importancia: 8, confianca: 4 },
      { date: '2026-10-09', importancia: null, confianca: 6 },
    ]);
  });
});

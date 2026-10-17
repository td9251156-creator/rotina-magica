import { PRACTICES, practiceSeconds } from './routine';
import { APPROACHES, approachOf, techniqueIds } from './therapies';
import { TECHNIQUES } from './training';

describe('terapias e vivências', () => {
  it('toda técnica aparece em exatamente uma abordagem', () => {
    const listed = APPROACHES.flatMap(techniqueIds);
    expect(new Set(listed).size).toBe(listed.length);
    expect([...listed].sort()).toEqual(TECHNIQUES.map((t) => t.id).sort());
  });

  it('toda abordagem diz o que é e qual a base, e só aponta para o que existe', () => {
    APPROACHES.forEach((a) => {
      expect(a.what && a.evidence && a.name).toBeTruthy();
      a.items.forEach((i) => {
        if (i.kind === 'pratica') expect(PRACTICES[i.id].phases.length).toBeGreaterThan(0);
      });
    });
    expect(approachOf('balanca')?.name).toBe('Entrevista motivacional');
  });

  it('o espaço de respiração dura 3 minutos', () => {
    expect(practiceSeconds(PRACTICES.sober)).toBe(180);
    expect(PRACTICES.sober.phases.map((p) => p.label)).toEqual(['Pare', 'Observe', 'Respire', 'Amplie', 'Escolha']);
  });
});

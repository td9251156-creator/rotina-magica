import { ALL_STEPS, ESSENTIAL_STEP_IDS, PRACTICES, essentialRoutine, findStep, isHardDay, lastWeekCount, periodFor, phaseAt, practiceSeconds, routineDays, routineFor } from './routine';

describe('rotina', () => {
  it('tem ids únicos e acha passos', () => {
    expect(new Set(ALL_STEPS.map((s) => s.id)).size).toBe(ALL_STEPS.length);
    expect(findStep('n_diario')?.link).toBe('diario');
  });

  it('período do dia segue a hora e a saída do trabalho', () => {
    expect(periodFor(new Date(2026, 9, 16, 7), '18:00')).toBe('manha');
    expect(periodFor(new Date(2026, 9, 16, 15), '18:00')).toBe('tarde');
    expect(periodFor(new Date(2026, 9, 16, 18, 30), '18:00')).toBe('noite');
    expect(periodFor(new Date(2026, 9, 16, 2), '18:00')).toBe('noite');
  });

  it('dias com rotina só crescem', () => {
    expect(routineDays(['2026-10-01', '2026-10-01', '2026-10-10'])).toBe(2);
    expect(lastWeekCount(['2026-10-01', '2026-10-12', '2026-10-16'], '2026-10-16')).toBe(2);
  });

  it('prática guiada avança pelas fases', () => {
    const p = PRACTICES.respiracao;
    expect(practiceSeconds(p)).toBe(240);
    expect(phaseAt(p, 0)?.phase.label).toBe('Inspire');
    expect(phaseAt(p, 5)).toMatchObject({ phase: { label: 'Segure' }, left: 3 });
    expect(phaseAt(p, 240)).toBeNull();
  });

  it('a rotina simples troca o ritual sem mudar os ids', () => {
    const magica = routineFor('magica').flatMap((p) => p.steps);
    const simples = routineFor('simples').flatMap((p) => p.steps);
    expect(simples.map((s) => s.id)).toEqual(magica.map((s) => s.id));
    expect(findStep('n_pilar', 'simples')).toMatchObject({ title: 'Relaxar o corpo', practice: 'relaxar' });
    expect(simples.some((s) => /pentagrama|saudação ao Sol/i.test(s.how.join(' ')))).toBe(false);
    expect(practiceSeconds(PRACTICES.relaxar)).toBe(130);
  });

  it('dia difícil: só o básico, em todos os períodos, e só no dia marcado', () => {
    const essentials = essentialRoutine(routineFor('simples'));
    expect(essentials.flatMap((p) => p.steps.map((s) => s.id))).toEqual([...ESSENTIAL_STEP_IDS]);
    expect(essentials.every((p) => p.steps.length > 0)).toBe(true);
    expect(essentials.flatMap((p) => p.steps).reduce((m, s) => m + s.minutes, 0)).toBeLessThanOrEqual(10);
    expect(isHardDay('2026-10-17', '2026-10-17')).toBe(true);
    expect(isHardDay('2026-10-16', '2026-10-17')).toBe(false);
    expect(isHardDay(null, '2026-10-17')).toBe(false);
  });
});

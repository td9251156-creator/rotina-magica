import { alcoholLink, cravingNightLink, lastDays, moneyKept, planStats, riskiestWeekday } from './lab';

describe('laboratório pessoal', () => {
  it('conta noites e noites sem uso por plano', () => {
    const stats = planStats([
      { date: '2026-10-10', planItemId: 'academia', used: false, alcohol: null },
      { date: '2026-10-11', planItemId: 'academia', used: false, alcohol: null },
      { date: '2026-10-12', planItemId: 'serie', used: true, alcohol: null },
      { date: '2026-10-13', planItemId: 'serie', used: null, alcohol: null },
      { date: '2026-10-14', planItemId: null, used: true, alcohol: null },
    ]);
    expect(stats).toEqual([
      { planItemId: 'academia', nights: 2, clean: 2 },
      { planItemId: 'serie', nights: 1, clean: 0 },
    ]);
  });

  it('aponta o dia da semana mais pesado só quando é claro', () => {
    expect(riskiestWeekday(['2026-10-09', '2026-10-16', '2026-10-14'])).toBe('sexta');
    expect(riskiestWeekday(['2026-10-09'])).toBeNull();
    expect(riskiestWeekday(['2026-10-09', '2026-10-16', '2026-10-14', '2026-10-07'])).toBeNull();
  });

  it('compara álcool só com dados suficientes', () => {
    const n = (alcohol: boolean, used: boolean, i: number) => ({ date: `2026-10-0${i}`, planItemId: null, alcohol, used });
    expect(alcoholLink([n(true, true, 1), n(false, false, 2)])).toBeNull();
    const link = alcoholLink([n(true, true, 1), n(true, true, 2), n(true, false, 3), n(false, false, 4), n(false, false, 5), n(false, true, 6)]);
    expect(link).toEqual({ withAlcohol: { nights: 3, used: 2 }, withoutAlcohol: { nights: 3, used: 1 } });
  });

  it('dinheiro mantido é só informação e exige valor informado', () => {
    expect(moneyKept(null, 10)).toBeNull();
    expect(moneyKept(350, 14)).toBe(700);
  });

  it('lista dias anteriores sem passar do início', () => {
    expect(lastDays('2026-10-16', 5, '2026-10-14')).toEqual(['2026-10-15', '2026-10-14']);
  });

  it('cruza vontade do diário com noites conhecidas, só com dados suficientes', () => {
    const nights = [
      { date: '2026-10-10', used: false },
      { date: '2026-10-11', used: false },
      { date: '2026-10-12', used: true },
      { date: '2026-10-13', used: true },
    ];
    expect(
      cravingNightLink(nights, [
        { date: '2026-10-10', craving: 3 },
        { date: '2026-10-11', craving: 5 },
        { date: '2026-10-12', craving: 8 },
        { date: '2026-10-13', craving: 7 },
      ]),
    ).toEqual({
      clean: { nights: 2, averageCraving: 4 },
      used: { nights: 2, averageCraving: 7.5 },
    });
    expect(cravingNightLink(nights.slice(0, 3), [{ date: '2026-10-10', craving: 3 }])).toBeNull();
  });
});

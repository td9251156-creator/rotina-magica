import { addDays } from './dates';
import { forecastFor, forecastText, riskReminder, riskReminderLabel } from './forecast';

// 2026-10-16 é uma sexta-feira.
const today = '2026-10-16';
const fridays = [7, 14, 21, 28].map((n) => addDays(today, -n));
const others = [1, 2, 3, 4, 5, 6].map((n) => addDays(today, -n));

describe('clima de hoje', () => {
  it('sem dados suficientes, não arrisca previsão', () => {
    expect(forecastFor({ today, journal: [], cravings: [], useDates: [] })).toBeNull();
    const current = Array.from({ length: 3 }, () => ({ date: today, occurredAt: `${today}T12:00:00`, intensity: 5 }));
    expect(forecastFor({ today, journal: [], cravings: current, useDates: [] })).toBeNull();
    const otherDays = others.slice(0, 3).map((date) => ({ date, craving: 2, triggers: [] }));
    expect(forecastFor({ today, journal: otherDays, cravings: [], useDates: [] })).toBeNull();
  });

  it('marca alto quando o mesmo dia da semana tem vontade bem acima da média', () => {
    const journal = [
      ...fridays.map((date) => ({ date, craving: 8, triggers: ['Tédio'] })),
      ...others.map((date) => ({ date, craving: 3, triggers: ['Estresse'] })),
    ];
    const cravings = fridays.map((date) => ({ occurredAt: `${date}T19:20:00`, date, intensity: 7 }));
    const f = forecastFor({ today, journal, cravings, useDates: [] })!;
    expect(f).toMatchObject({ level: 'alto', weekday: 'sexta', peakHour: 19, topTrigger: 'Tédio' });
    expect(forecastText(f)).toMatch(/^Sextas têm sido mais difíceis/);
  });

  it('um uso no mesmo dia da semana nas últimas 4 semanas já pede atenção máxima', () => {
    const journal = others.map((date) => ({ date, craving: 2, triggers: [] }));
    expect(forecastFor({ today, journal, cravings: [], useDates: [fridays[1]] })?.level).toBe('alto');
  });

  it('dia tranquilo quando o histórico do dia é baixo', () => {
    const journal = [...fridays, ...others].map((date) => ({ date, craving: 2, triggers: [] }));
    const f = forecastFor({ today, journal, cravings: [], useDates: [] })!;
    expect(f.level).toBe('calmo');
    expect(forecastText(f)).toMatch(/Sextas costumam ser tranquilas/);
  });
});

describe('lembrete antes da hora de risco', () => {
  const journal = [
    ...fridays.map((date) => ({ date, craving: 8, triggers: ['Tédio'] })),
    ...others.map((date) => ({ date, craving: 3, triggers: ['Estresse'] })),
  ];
  const cravings = fridays.map((date) => ({ occurredAt: `${date}T19:20:00`, date, intensity: 7 }));

  it('meia hora antes do pico, só nos dias que pedem atenção', () => {
    const r = riskReminder({ today, journal, cravings, useDates: [] })!;
    expect(r).toEqual({ time: '18:30', days: [5] });
    expect(riskReminderLabel(r)).toBe('sextas às 18h30');
  });

  it('sem hora de pico, não sugere lembrete; sem dia que se destaque, vale todo dia', () => {
    expect(riskReminder({ today, journal, cravings: [], useDates: [] })).toBeNull();
    // Um pedido de ajuda numa quinta com duas quintas tranquilas no diário não marca a quinta.
    const calm = [...fridays, ...others, addDays(today, -8)].map((date) => ({ date, craving: 2, triggers: [] }));
    const r = riskReminder({ today, journal: calm, cravings: [{ occurredAt: `${today}T07:00:00`, date: addDays(today, -1), intensity: 3 }], useDates: [] })!;
    expect(r.days).toHaveLength(7);
    expect(riskReminderLabel(r)).toBe('todo dia às 6h30');
    expect(riskReminderLabel({ time: '21:00', days: [6, 5, 0] })).toBe('sextas, sábados e domingos às 21h');
  });
});

import { buildDailyReminderIcs } from './calendar';
import { isCareMode } from './care';
import { dayPhase } from './day-phase';

describe('modo cuidado', () => {
  it('fica ativo por 36 horas depois do uso', () => {
    const now = new Date('2026-10-16T12:00:00');
    expect(isCareMode(null, now)).toBe(false);
    expect(isCareMode('2026-10-15T23:00:00', now)).toBe(true);
    expect(isCareMode('2026-10-14T23:00:00', now)).toBe(false);
  });
});

describe('fase do dia', () => {
  const at = (h: number, m = 0) => new Date(2026, 9, 16, h, m);
  it('organiza o dia em torno da saída do trabalho', () => {
    expect(dayPhase(at(3), '18:00')).toBe('madrugada');
    expect(dayPhase(at(9), '18:00')).toBe('manha');
    expect(dayPhase(at(14), '18:00')).toBe('tarde');
    expect(dayPhase(at(17, 15), '18:00')).toBe('saida');
    expect(dayPhase(at(18, 59), '18:00')).toBe('saida');
    expect(dayPhase(at(21), '18:00')).toBe('noite');
  });
});

describe('lembrete na agenda', () => {
  it('gera evento diário útil com alarme e título discreto', () => {
    const ics = buildDailyReminderIcs({ time: '18:30', url: 'https://x.github.io/recomeco/', now: new Date(2026, 9, 16, 10) });
    expect(ics).toContain('DTSTART:20261016T183000');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('URL:https://x.github.io/recomeco/');
    expect(ics).not.toMatch(/coca|droga|uso/i);
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR');
    const morning = buildDailyReminderIcs({ time: '08:00', title: 'Rotina: começar o dia', url: 'https://x', now: new Date(2026, 9, 16, 10) });
    expect(morning).toContain('DTSTART:20261016T080000');
    expect(morning).toContain('SUMMARY:Rotina: começar o dia');
    expect(morning).not.toMatch(/coca|droga|uso/i);
  });

  it('lembrete em dias escolhidos começa no primeiro desses dias', () => {
    // 2026-10-16 é sexta: o primeiro sábado é dia 17; a regra lista os dias de segunda a domingo.
    const ics = buildDailyReminderIcs({ time: '18:30', url: 'https://x', now: new Date(2026, 9, 16, 10), days: [0, 6] });
    expect(ics).toContain('DTSTART:20261017T183000');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA,SU');
  });
});

describe('ajuste depois do uso', () => {
  it('sugere uma mudança a partir do que veio antes', async () => {
    const { suggestAdjustment } = await import('./care');
    expect(suggestAdjustment(['Bebi', 'Sozinho'], null)).toMatch(/beber/);
    expect(suggestAdjustment([], 'No caminho de volta')).toMatch(/plano da noite/);
    expect(suggestAdjustment([], null)).toMatch(/SOS/);
  });
});

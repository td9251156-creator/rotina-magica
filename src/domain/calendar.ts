/**
 * O app web não consegue disparar notificação agendada com o app fechado no Android. A agenda do
 * celular consegue, e é confiável. Geramos um evento diário (arquivo .ics) com alarme na hora da
 * saída e o link do app. Título neutro, para a tela bloqueada não revelar nada.
 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
/** Segunda a sexta (0 = domingo). */
export const WORKDAYS = [1, 2, 3, 4, 5];

export function buildDailyReminderIcs({
  time,
  url,
  now,
  title = 'Rotina: como vai ser a noite?',
  days = WORKDAYS,
}: {
  time: string;
  url: string;
  now: Date;
  title?: string;
  /** Dias da semana do alarme (0 = domingo). */
  days?: readonly number[];
}): string {
  const [h, m] = time.split(':').map(Number);
  // O primeiro alarme cai no primeiro dia escolhido a partir de hoje: a agenda espera o começo alinhado à regra.
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (days.length && !days.includes(first.getDay())) first.setDate(first.getDate() + 1);
  const start = `${first.getFullYear()}${pad(first.getMonth() + 1)}${pad(first.getDate())}T${pad(h)}${pad(m)}00`;
  const byday = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => BYDAY[d]);
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rumo//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:rumo-saida-${stamp}@rumo`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    'DURATION:PT10M',
    `RRULE:FREQ=WEEKLY;BYDAY=${byday.join(',')}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(`Abra: ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

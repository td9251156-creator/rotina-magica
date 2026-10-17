/**
 * "Seu laboratório": cada noite é um experimento. Em vez de conselho genérico, o app mostra o que
 * funcionou para VOCÊ: quais planos de noite deram noites sem uso, que dias pesam mais, se o
 * álcool muda as coisas. Funções puras, sem julgamento.
 */
import { addDays, daysBetween, type LocalDate } from './dates';

export interface NightRecord {
  date: LocalDate;
  planItemId: string | null;
  used: boolean | null;
  alcohol: boolean | null;
}

export interface PlanStat {
  planItemId: string;
  nights: number;
  clean: number;
}

export interface CravingNightLink {
  clean: { nights: number; averageCraving: number };
  used: { nights: number; averageCraving: number };
}

/** Cruza notas do Diário com o resultado da noite, sem transformar associação em causa. */
export function cravingNightLink(
  nights: readonly Pick<NightRecord, 'date' | 'used'>[],
  journal: readonly { date: LocalDate; craving: number | null }[],
): CravingNightLink | null {
  const outcome = new Map(nights.filter((n) => n.used !== null).map((n) => [n.date, n.used]));
  const groups = { clean: [] as number[], used: [] as number[] };
  for (const entry of journal) {
    const used = outcome.get(entry.date);
    if (entry.craving === null || used === undefined) continue;
    groups[used ? 'used' : 'clean'].push(entry.craving);
  }
  if (groups.clean.length < 2 || groups.used.length < 2) return null;
  const average = (values: number[]) => Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  return {
    clean: { nights: groups.clean.length, averageCraving: average(groups.clean) },
    used: { nights: groups.used.length, averageCraving: average(groups.used) },
  };
}

/** Noites com plano escolhido e resultado conhecido, por plano. Mais testado primeiro. */
export function planStats(nights: readonly NightRecord[]): PlanStat[] {
  const map = new Map<string, PlanStat>();
  for (const n of nights) {
    if (!n.planItemId || n.used === null) continue;
    const s = map.get(n.planItemId) ?? { planItemId: n.planItemId, nights: 0, clean: 0 };
    s.nights += 1;
    if (!n.used) s.clean += 1;
    map.set(n.planItemId, s);
  }
  return [...map.values()].sort((a, b) => b.nights - a.nights || b.clean - a.clean);
}

export const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const;

function weekday(date: LocalDate): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Dia da semana com mais uso, se houver um claramente acima (pelo menos 2 usos e mais que os outros). */
export function riskiestWeekday(useDates: readonly LocalDate[]): string | null {
  const counts = new Array(7).fill(0) as number[];
  useDates.forEach((d) => (counts[weekday(d)] += 1));
  const max = Math.max(...counts);
  if (max < 2 || counts.filter((c) => c === max).length > 1) return null;
  return WEEKDAYS[counts.indexOf(max)];
}

export interface AlcoholLink {
  withAlcohol: { nights: number; used: number };
  withoutAlcohol: { nights: number; used: number };
}

/** Compara noites com e sem álcool. Só faz sentido mostrar com pelo menos 3 noites de cada lado. */
export function alcoholLink(nights: readonly NightRecord[]): AlcoholLink | null {
  const known = nights.filter((n) => n.alcohol !== null && n.used !== null);
  const w = known.filter((n) => n.alcohol);
  const wo = known.filter((n) => !n.alcohol);
  if (w.length < 3 || wo.length < 3) return null;
  return {
    withAlcohol: { nights: w.length, used: w.filter((n) => n.used).length },
    withoutAlcohol: { nights: wo.length, used: wo.filter((n) => n.used).length },
  };
}

/** Dinheiro que deixou de ir para a droga: gasto semanal médio informado × semanas sem uso. Só informação. */
export function moneyKept(weeklySpending: number | null, cleanDays: number): number | null {
  if (!weeklySpending || weeklySpending <= 0) return null;
  return Math.round((weeklySpending / 7) * cleanDays);
}

/** Datas de ontem até `days` dias atrás, da mais recente para a mais antiga. */
export function lastDays(today: LocalDate, days: number, start: LocalDate): LocalDate[] {
  const out: LocalDate[] = [];
  for (let i = 1; i <= days; i++) {
    const d = addDays(today, -i);
    if (daysBetween(start, d) < 0) break;
    out.push(d);
  }
  return out;
}

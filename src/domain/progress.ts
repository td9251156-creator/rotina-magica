import { addDays, daysBetween, type LocalDate } from './dates';

/**
 * Só respostas explícitas entram na contagem: ausência de registro não prova ausência de uso.
 * Um episódio não apaga dias anteriores confirmados.
 */
export interface Progress {
  /** Dias acompanhados, contando hoje. */
  trackedDays: number;
  /** Total acumulado de dias sem uso. Nunca diminui por causa de um lapso. */
  cleanDays: number;
  /** Dias sem informação de uso. */
  unknownDays: number;
  /** cleanDays / dias com resposta, de 0 a 1. */
  cleanRatio: number;
  /** Dias seguidos com resposta "sem uso" até hoje. */
  currentStreak: number;
  /** Maior sequência já alcançada, mostrada como recorde, não como placar. */
  bestStreak: number;
  /** Proporção de dias sem uso nos últimos 30 dias (ou menos, se o acompanhamento for mais curto). */
  last30CleanRatio: number;
  todayStatus: 'sem_uso' | 'uso' | 'sem_registro';
}

export interface ProgressInput {
  /** Primeiro dia acompanhado: data de parada, ou o dia em que começou a usar o app. */
  startDate: LocalDate;
  today: LocalDate;
  /** Dias em que houve uso. Duplicatas e datas fora do período são ignoradas. */
  useDates: readonly LocalDate[];
  /** Check-ins ou resultados de noite que confirmam ausência de uso. */
  noUseDates: readonly LocalDate[];
}

const EMPTY: Progress = {
  trackedDays: 0,
  cleanDays: 0,
  unknownDays: 0,
  cleanRatio: 0,
  currentStreak: 0,
  bestStreak: 0,
  last30CleanRatio: 0,
  todayStatus: 'sem_registro',
};

export function computeProgress({ startDate, today, useDates, noUseDates }: ProgressInput): Progress {
  const trackedDays = daysBetween(startDate, today) + 1;
  if (trackedDays <= 0) return EMPTY;

  const uses = new Set(useDates.filter((d) => d >= startDate && d <= today));
  const clean = new Set(noUseDates.filter((d) => d >= startDate && d <= today && !uses.has(d)));

  let bestStreak = 0;
  let run = 0;
  for (let i = 0; i < trackedDays; i++) {
    if (uses.has(addDays(startDate, i))) {
      run = 0;
    } else if (clean.has(addDays(startDate, i))) {
      run++;
      bestStreak = Math.max(bestStreak, run);
    } else {
      run = 0;
    }
  }

  const windowDays = Math.min(30, trackedDays);
  let knownInWindow = 0;
  let cleanInWindow = 0;
  for (let i = 0; i < windowDays; i++) {
    const date = addDays(today, -i);
    if (uses.has(date) || clean.has(date)) knownInWindow++;
    if (clean.has(date)) cleanInWindow++;
  }

  const cleanDays = clean.size;
  const knownDays = cleanDays + uses.size;
  return {
    trackedDays,
    cleanDays,
    unknownDays: trackedDays - knownDays,
    cleanRatio: knownDays ? cleanDays / knownDays : 0,
    currentStreak: run,
    bestStreak,
    last30CleanRatio: knownInWindow ? cleanInWindow / knownInWindow : 0,
    todayStatus: uses.has(today) ? 'uso' : clean.has(today) ? 'sem_uso' : 'sem_registro',
  };
}

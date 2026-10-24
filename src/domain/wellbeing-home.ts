import { addDays, type LocalDate } from './dates';

/** Humor do diário geral: 1 = muito pesado … 5 = bem. Os rótulos são os mesmos do Diário. */
export const MOODS = ['Muito pesado', 'Pesado', 'Mais ou menos', 'Um pouco melhor', 'Bem'] as const;

export interface MoodCare {
  /** Frase curta de acolhimento, sem avaliar o humor como bom ou ruim. */
  message: string;
  /** Vivência sugerida para este momento. */
  techniqueId: string;
}

/**
 * Um cuidado que combina com o humor escolhido no início. Humor pesado leva ao corpo e à autocompaixão;
 * humor intermediário, a diminuir o tamanho do dia; humor bom, a notar o que ajudou (para lembrar depois).
 */
export function careForMood(mood: number): MoodCare {
  if (mood <= 1) return { message: 'Obrigado por contar. Não precisa atravessar isso de uma vez.', techniqueId: 'acolher_momento' };
  if (mood === 2) return { message: 'Dia pesado. Um cuidado pequeno já conta.', techniqueId: 'pausa_corpo' };
  if (mood === 3) return { message: 'Um dia no meio do caminho. Que tal diminuir o tamanho do próximo passo?', techniqueId: 'proximo_passo' };
  return { message: 'Que bom. Vale guardar o que ajudou hoje para lembrar num dia difícil.', techniqueId: 'revisao_gentil' };
}

export interface CareDay {
  date: LocalDate;
  cared: boolean;
}

/**
 * Os últimos sete dias, terminando hoje, marcando os dias com algum cuidado (vivência ou registro).
 * É uma memória do que a pessoa fez, nunca uma sequência que zera.
 */
export function careWeek(today: LocalDate, caredDates: Iterable<LocalDate>): CareDay[] {
  const set = new Set(caredDates);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, cared: set.has(date) };
  });
}

/** À noite (a partir das 21h e até as 4h), o convite do dia é a Rotina para dormir. */
export function isBedtime(now: Date): boolean {
  const h = now.getHours();
  return h >= 21 || h < 4;
}

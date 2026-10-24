import { addDays, type LocalDate } from './dates';

/**
 * Humor do diário geral: 1 = muito difícil … 5 = muito bem. Os rótulos são os mesmos do Diário.
 * Só os números ficam guardados, então registros antigos continuam valendo com os rótulos novos.
 */
export const MOODS = ['Muito difícil', 'Difícil', 'Mais ou menos', 'Bem', 'Muito bem'] as const;

export interface MoodCare {
  /** Frase curta de acolhimento, sem avaliar o humor como bom ou ruim. */
  message: string;
  /** Vivência sugerida para este momento; sem vivência, o convite é escrever no Diário. */
  techniqueId: string | null;
}

/**
 * Um cuidado que combina com o humor escolhido no início. Humor muito pesado leva ao corpo, difícil à
 * autocompaixão, intermediário a diminuir o tamanho do próximo passo; humor bom, a notar o que ajuda
 * (para lembrar num dia difícil).
 */
export function careForMood(mood: number): MoodCare {
  if (mood <= 1) return { message: 'Parece um momento muito pesado. Vamos cuidar só deste minuto.', techniqueId: 'pausa_corpo' };
  if (mood === 2) return { message: 'Dias difíceis pedem menos, não mais. Que tal palavras mais gentis?', techniqueId: 'acolher_momento' };
  if (mood === 3) return { message: 'Um dia no meio do caminho. Dá para escolher só o próximo passo.', techniqueId: 'proximo_passo' };
  if (mood === 4) return { message: 'Que bom. Vale notar o que está ajudando hoje.', techniqueId: 'ancorar_sentidos' };
  return { message: 'Que bom ouvir isso. Quer guardar o que fez bem?', techniqueId: null };
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

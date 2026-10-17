import type { GameId } from '@/domain/progression';

/** Um símbolo por jogo, para achar o jogo de olho, sem ler. */
export const GAME_ICON: Record<GameId, string> = {
  blocos: '▦',
  pares: '❖',
  desvia: '⇅',
  rebate: '↯',
  onda: '∿',
  noite: '☾',
};

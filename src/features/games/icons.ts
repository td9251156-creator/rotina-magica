import type { GameId } from '@/domain/progression';
import type { IconId } from '@/ui/app-icons';

/** Um ícone por jogo, para achar o jogo de olho, sem ler. */
export const GAME_ICON: Record<GameId, IconId> = {
  blocos: 'jogo_blocos',
  pares: 'jogo_pares',
  arcanos: 'jogo_arcanos',
  onda: 'jogo_onda',
  noite: 'jogo_noite',
};

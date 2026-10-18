/**
 * Evolução: jogar e treinar dão experiência (XP), que só cresce. Nada se perde num dia ruim,
 * como no progresso de dias sem uso. O XP mede prática de habilidades, não abstinência.
 */
import { daysBetween, type LocalDate } from './dates';

export const GAME_IDS = ['blocos', 'pares', 'arcanos', 'onda', 'noite'] as const;
export type GameId = (typeof GAME_IDS)[number];

export const GAME_INFO: Record<GameId, { title: string; skill: string; pitch: string }> = {
  blocos: { title: 'Blocos', skill: 'Foco', pitch: 'Encaixe peças. 3 minutos de jogo baixam a força da vontade.' },
  pares: { title: 'Pares', skill: 'Atenção', pitch: 'Ache pares de peças livres na pilha, no estilo Mahjong. Prende a cabeça.' },
  arcanos: { title: 'Arcanos', skill: 'Memória', pitch: 'Jogo da memória com os 22 Arcanos do tarô. Cada par traz uma ideia para a vida.' },
  onda: { title: 'Segura a onda', skill: 'Calma', pitch: 'Respire no ritmo do dedo e veja a onda baixar.' },
  noite: { title: 'A noite', skill: 'Decisão', pitch: 'Ensaie a sua noite de risco. Cada escolha mexe na vontade.' },
};

/** Jogos que saíram do app: o nome fica para o histórico (laboratório, A noite) e o XP já ganho continua valendo. */
export const RETIRED_GAME_NAMES: Record<string, string> = { desvia: 'Desvia', rebate: 'Rebate' };

/** Nome de qualquer jogo já registrado, inclusive dos que saíram. */
export function gameTitle(id: string): string {
  return (GAME_INFO as Record<string, { title: string } | undefined>)[id]?.title ?? RETIRED_GAME_NAMES[id] ?? id;
}

const XP_DIVISOR: Record<GameId, number> = { blocos: 15, pares: 8, arcanos: 4, onda: 6, noite: 9 };

export function xpForGame(game: GameId, score: number): number {
  return Math.min(120, Math.max(10, Math.round(score / XP_DIVISOR[game])));
}

export const XP_PER_TECHNIQUE = 40;

/** XP para chegar ao nível L: 50·L·(L−1). Nível 2 = 100, 3 = 300, 4 = 600… */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

const LEVEL_NAMES = ['Começo', 'Atenção', 'Reflexo', 'Controle', 'Domínio', 'Rumo firme', 'Mestre da noite'];

export function levelFor(totalXp: number): { level: number; name: string; into: number; needed: number; progress: number } {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) level++;
  const into = totalXp - xpForLevel(level);
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  return { level, name: LEVEL_NAMES[level - 1] ?? `Nível ${level}`, into, needed, progress: into / needed };
}

export interface SessionLike {
  gameId: string;
  date: LocalDate;
  score: number;
  xp: number;
}

export function totalXp(sessions: readonly SessionLike[], techniquesDone: number): number {
  return sessions.reduce((sum, s) => sum + s.xp, 0) + techniquesDone * XP_PER_TECHNIQUE;
}

export function bestScore(sessions: readonly SessionLike[], game: GameId): number {
  return sessions.filter((s) => s.gameId === game).reduce((m, s) => Math.max(m, s.score), 0);
}

/** Jogo do dia: reveza entre os jogos de treino (Blocos fica para a hora da vontade e para jogar livre). */
export function gameOfTheDay(today: LocalDate, start: LocalDate): GameId {
  const rotation: GameId[] = ['pares', 'onda', 'noite'];
  const i = ((daysBetween(start, today) % rotation.length) + rotation.length) % rotation.length;
  return rotation[i];
}

/** Dias diferentes com algum treino: conta para sempre, não é sequência que quebra. */
export function trainedDays(dates: readonly LocalDate[]): number {
  return new Set(dates).size;
}

/** Modo rápido do Blocos: abre com a prática (nível do app), começa num nível de queda mais veloz. */
export const FAST_BLOCKS = { unlockLevel: 3, startLevel: 5 } as const;

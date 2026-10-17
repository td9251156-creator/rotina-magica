import type { LocalDate } from '@/domain/dates';

/**
 * Interfaces da camada de dados. A UI depende só delas. Hoje há uma implementação local
 * (armazenamento do navegador, no próprio celular); uma futura implementação com
 * sincronização ou criptografia implementa as mesmas.
 */

export const planItemKinds = [
  'razao',
  'gatilho',
  'sinal_alerta',
  'estrategia',
  'se_entao',
  'atividade',
  'pessoa',
  'barreira',
  'plano_noite',
  /** Resposta pronta a um pensamento que dá permissão para usar (extra.thought). */
  'resposta',
  /** Como a noite termina quando usa ("o filme até o fim"). */
  'filme',
  /** Cena de um futuro bom, imaginada no treino. */
  'futuro',
  /** Frase pronta para recusar uma oferta (extra.thought = a situação). */
  'recusa',
  /** Frase gentil para si mesmo, para depois de um dia difícil (autocompaixão). */
  'gentileza',
] as const;
export type PlanItemKind = (typeof planItemKinds)[number];

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checkin extends Entity {
  date: LocalDate;
  mood: number | null;
  craving: number | null;
  sleepQuality: number | null;
  stress: number | null;
  alcohol: boolean | null;
  used: boolean | null;
  note: string | null;
}
export type CheckinInput = Omit<Checkin, keyof Entity>;

/** ainda_forte: a ação escolhida não bastou (conta como tentativa que não funcionou). */
export type CravingOutcome = 'passou' | 'ainda_forte' | 'usei' | 'em_andamento';
export interface Craving extends Entity {
  occurredAt: string;
  date: LocalDate;
  /** 0 a 10; null quando não foi perguntado (no SOS não pedimos nota para não atrasar). */
  intensity: number | null;
  intensityAfter: number | null;
  trigger: string | null;
  coping: string | null;
  outcome: CravingOutcome;
  note: string | null;
}
export type CravingInput = Omit<Craving, keyof Entity | 'date'>;

export interface UseEvent extends Entity {
  occurredAt: string;
  date: LocalDate;
  amountSpent: number | null;
  note: string | null;
}
export type UseEventInput = Omit<UseEvent, keyof Entity | 'date'>;

export interface PlanItem extends Entity {
  kind: PlanItemKind;
  text: string;
  extra: Record<string, unknown> | null;
  position: number;
}
export type PlanItemInput = Pick<PlanItem, 'kind' | 'text'> & Partial<Pick<PlanItem, 'extra'>>;

export interface CheckinRepository {
  /** Cria ou substitui o check-in do dia. */
  upsertForDate(input: CheckinInput): Checkin;
  getByDate(date: LocalDate): Checkin | null;
  listBetween(from: LocalDate, to: LocalDate): Checkin[];
}

export interface CravingRepository {
  add(input: CravingInput): Craving;
  update(id: string, patch: Partial<CravingInput>): Craving;
  listBetween(from: LocalDate, to: LocalDate): Craving[];
  remove(id: string): void;
}

export interface UseEventRepository {
  add(input: UseEventInput): UseEvent;
  remove(id: string): void;
  /**
   * Dias com uso: episódios registrados mais check-ins marcados como "usei".
   * Fonte única para o cálculo de progresso.
   */
  useDatesBetween(from: LocalDate, to: LocalDate): LocalDate[];
  /** Momento do episódio de uso mais recente (para o modo cuidado). */
  lastOccurredAt(): string | null;
}

export interface PlanRepository {
  list(kind?: PlanItemKind): PlanItem[];
  add(input: PlanItemInput): PlanItem;
  update(id: string, patch: Partial<PlanItemInput>): PlanItem;
  remove(id: string): void;
  /** Reordena os itens de um tipo conforme a lista de ids. */
  reorder(kind: PlanItemKind, ids: readonly string[]): void;
}

export type EveningOutcome = 'sem_uso' | 'usei';
export interface EveningChoice extends Entity {
  date: LocalDate;
  planItemId: string;
  outcome: EveningOutcome | null;
  note: string | null;
}

export interface EveningRepository {
  /** Escolhe (ou troca) o plano da noite. */
  choose(date: LocalDate, planItemId: string): EveningChoice;
  getForDate(date: LocalDate): EveningChoice | null;
  setOutcome(date: LocalDate, outcome: EveningOutcome, note?: string | null): EveningChoice;
  listBetween(from: LocalDate, to: LocalDate): EveningChoice[];
}

/** Um treino feito (técnica praticada num dia). */
export interface Practice extends Entity {
  date: LocalDate;
  techniqueId: string;
  /** Notas dadas no exercício (ex.: régua de 0 a 10). Registros antigos não têm. */
  scores?: Record<string, number>;
}

/** Uma partida de jogo. */
export interface GameSession extends Entity {
  date: LocalDate;
  gameId: string;
  score: number;
  xp: number;
  durationMs: number;
  /** Detalhes do jogo (acertos, linhas, nota da vontade antes/depois…). */
  extra: Record<string, unknown> | null;
}
export type GameSessionInput = Omit<GameSession, keyof Entity>;

export interface GameRepository {
  add(input: GameSessionInput): GameSession;
  list(): GameSession[];
}

export interface PracticeRepository {
  add(techniqueId: string, date: LocalDate, scores?: Record<string, number>): Practice;
  list(): Practice[];
}

/** Passo da rotina feito num dia (marcar de novo desfaz). */
export interface RoutineMark extends Entity {
  date: LocalDate;
  stepId: string;
}

export interface RoutineRepository {
  toggle(date: LocalDate, stepId: string, done?: boolean): void;
  doneOn(date: LocalDate): string[];
  /** Datas com pelo menos um passo feito. */
  activeDates(): LocalDate[];
}

/** Diário Mágico: registro clínico do dia, sem culpa. */
export interface JournalEntry extends Entity {
  date: LocalDate;
  craving: number | null;
  triggers: string[];
  breaks: number;
  trick: string | null;
  victory: string | null;
}
export type JournalInput = Omit<JournalEntry, keyof Entity>;

export interface JournalRepository {
  upsert(input: JournalInput): JournalEntry;
  getByDate(date: LocalDate): JournalEntry | null;
  listBetween(from: LocalDate, to: LocalDate): JournalEntry[];
}

/** Registro de pensamentos (TCC): corpo, emoção, pensamento, armadilhas e uma resposta mais justa. */
export interface ThoughtRecord extends Entity {
  date: LocalDate;
  body: string[];
  feelings: string[];
  thought: string | null;
  traps: string[];
  answer: string | null;
  /** O que a melhor versão da pessoa faria agora. */
  best: string | null;
}
export type ThoughtInput = Omit<ThoughtRecord, keyof Entity | 'date'>;

export interface ThoughtRepository {
  add(input: ThoughtInput): ThoughtRecord;
  /** Mais recentes primeiro. */
  list(): ThoughtRecord[];
}

export interface SettingsRepository {
  get<T>(key: SettingKey, fallback: T): T;
  set<T>(key: SettingKey, value: T): void;
}

export type SettingKey =
  | 'onboardingDone'
  | 'trackingStartDate'
  | 'quitDate'
  | 'workEndTime'
  | 'discreetMode'
  | 'dailyReminders'
  | 'weeklySpending'
  | 'lastBackupAt'
  | 'reminderAddedAt'
  | 'pinHash'
  | 'pinSalt'
  | 'backupSnoozeUntil'
  | 'oath'
  | 'routineStyle'
  | 'letter'
  | 'theme'
  | 'installDismissed'
  | 'gameSymbols'
  | 'hardDay';

export interface Repositories {
  routine: RoutineRepository;
  journal: JournalRepository;
  thoughts: ThoughtRepository;
  checkins: CheckinRepository;
  cravings: CravingRepository;
  useEvents: UseEventRepository;
  plan: PlanRepository;
  evenings: EveningRepository;
  practices: PracticeRepository;
  games: GameRepository;
  settings: SettingsRepository;
}

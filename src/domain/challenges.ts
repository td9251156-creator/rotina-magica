/**
 * Desafio da semana: uma meta de prática por semana (segunda a domingo), contada com o que a pessoa já
 * registra no app. Mede prática, nunca abstinência, e não pune: semana nova, desafio novo. A pessoa pode
 * trocar o desafio (escolher a própria meta aumenta o compromisso, como na entrevista motivacional).
 */
import { ROUTINE } from './routine';
import { addDays, daysBetween, type LocalDate } from './dates';

export interface WeekInput {
  /** Passos da rotina feitos em cada dia da semana (7 listas, de segunda a domingo). */
  routine: readonly (readonly string[])[];
  games: readonly { gameId: string }[];
  practices: readonly { techniqueId: string }[];
  thoughts: number;
  journalDays: number;
}

export interface Challenge {
  id: string;
  title: string;
  goal: number;
  /** A meta em uma frase. */
  task: string;
  why: string;
  /** Onde começar no app. */
  start: { route: 'rotina' | 'diario' | 'jogos' | 'treino' | 'pensamento'; param?: string; label: string };
  count: (w: WeekInput) => number;
}

const MORNING = new Set(ROUTINE.find((p) => p.id === 'manha')!.steps.map((s) => s.id));

export const CHALLENGES: readonly Challenge[] = [
  {
    id: 'manha',
    title: 'Começar no controle',
    goal: 4,
    task: 'Fazer pelo menos um passo da manhã em 4 dias.',
    why: 'Uma manhã com rotina deixa menos tempo vazio e dá a sensação de dirigir o dia.',
    start: { route: 'rotina', param: 'm_ra', label: 'Abrir a manhã' },
    count: (w) => w.routine.filter((day) => day.some((id) => MORNING.has(id))).length,
  },
  {
    id: 'diario',
    title: 'Fechar o dia',
    goal: 4,
    task: 'Escrever o diário em 4 dias.',
    why: 'Anotar a vontade e os gatilhos mostra os padrões. É assim que o Clima de hoje aprende.',
    start: { route: 'diario', label: 'Abrir o diário' },
    count: (w) => w.journalDays,
  },
  {
    id: 'jogos',
    title: 'Treinar a atenção',
    goal: 3,
    task: 'Jogar 3 jogos diferentes.',
    why: 'Jogos que prendem a atenção baixam a vontade. Variar treina mais de uma habilidade.',
    start: { route: 'jogos', label: 'Ver os jogos' },
    count: (w) => new Set(w.games.map((g) => g.gameId)).size,
  },
  {
    id: 'vivencias',
    title: 'Terapia na prática',
    goal: 3,
    task: 'Fazer 3 exercícios de Terapias e vivências.',
    why: 'Treinar com calma faz a técnica estar à mão quando a vontade chegar.',
    start: { route: 'treino', label: 'Ver os exercícios' },
    count: (w) => w.practices.length,
  },
  {
    id: 'pensamentos',
    title: 'Desatar nós',
    goal: 2,
    task: 'Desatar 2 pensamentos.',
    why: 'Olhar o pensamento de perto tira a força da permissão ("só hoje, eu mereço"). É o centro da TCC.',
    start: { route: 'pensamento', label: 'Desatar um pensamento' },
    count: (w) => w.thoughts,
  },
  {
    id: 'ensaio',
    title: 'Ensaiar a noite',
    goal: 2,
    task: 'Jogar A noite 2 vezes.',
    why: 'Ensaiar a noite de risco com calma prepara a resposta para quando ela chegar de verdade.',
    start: { route: 'jogos', param: 'noite', label: 'Jogar A noite' },
    count: (w) => w.games.filter((g) => g.gameId === 'noite').length,
  },
];

/** Segunda-feira da semana da data. */
export function weekStart(date: LocalDate): LocalDate {
  const [y, m, d] = date.split('-').map(Number);
  return addDays(date, -((new Date(y, m - 1, d).getDay() + 6) % 7));
}

/** Os 7 dias da semana, de segunda a domingo. */
export function weekDays(date: LocalDate): LocalDate[] {
  const monday = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Uma segunda qualquer, para girar os desafios semana a semana. */
const EPOCH = '2026-01-05';

export interface ChosenChallenge {
  week: LocalDate;
  id: string;
}

/** O desafio desta semana: o que a pessoa escolheu, ou o da vez no rodízio. */
export function challengeFor(today: LocalDate, chosen: ChosenChallenge | null): Challenge {
  const week = weekStart(today);
  const picked = chosen?.week === week ? CHALLENGES.find((c) => c.id === chosen.id) : undefined;
  if (picked) return picked;
  const n = CHALLENGES.length;
  return CHALLENGES[(((Math.floor(daysBetween(EPOCH, week) / 7)) % n) + n) % n];
}

/** O próximo da lista, para o botão "Trocar". */
export function nextChallenge(current: Challenge): Challenge {
  return CHALLENGES[(CHALLENGES.findIndex((c) => c.id === current.id) + 1) % CHALLENGES.length];
}

export function challengeProgress(challenge: Challenge, week: WeekInput): { count: number; done: boolean } {
  const count = Math.min(challenge.goal, challenge.count(week));
  return { count, done: count >= challenge.goal };
}

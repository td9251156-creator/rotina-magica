/**
 * Rebate: batalha contra pensamentos que dão permissão para usar. Cada pensamento ataca; a pessoa
 * escolhe, com o relógio correndo, a resposta que desmonta o pensamento (entre armadilhas que soam
 * razoáveis). Treina reestruturação cognitiva (TCC / prevenção de recaída de Marlatt) até ficar
 * automática. Quando a pessoa já escreveu a própria resposta no treino, ela vira a resposta certa.
 */
import { shuffle, type Rng } from './rng';

export interface Thought {
  text: string;
  strong: string;
  traps: readonly [string, string];
}

export const THOUGHTS: readonly Thought[] = [
  {
    text: 'Só hoje, amanhã eu paro',
    strong: 'Amanhã eu vou pensar a mesma coisa. Se eu quero parar, o dia é hoje',
    traps: ['Se for pouco, tudo bem', 'Amanhã eu compenso na academia'],
  },
  {
    text: 'Eu mereço depois do dia que tive',
    strong: 'Eu mereço uma noite boa e um amanhã inteiro, não 3h de vazio',
    traps: ['Mereço mesmo, foi pesado', 'Só para relaxar um pouco'],
  },
  {
    text: 'Já usei essa semana, tanto faz',
    strong: 'Um deslize não apaga nada. Cada noite sem usar conta',
    traps: ['Já estraguei, recomeço segunda', 'Melhor aproveitar e parar depois'],
  },
  {
    text: 'Ninguém vai saber',
    strong: 'Eu vou saber. E amanhã meu corpo vai saber',
    traps: ['Ninguém vai perceber mesmo', 'Se ninguém sabe, não prejudica'],
  },
  {
    text: 'Dessa vez eu controlo',
    strong: 'Eu já disse isso antes. O primeiro é que decide o resto da noite',
    traps: ['Hoje eu estou mais tranquilo', 'Se eu definir um limite dá certo'],
  },
  {
    text: 'Estou entediado, não tem nada pra fazer',
    strong: 'Tédio passa. Tenho um plano de noite: é só começar o primeiro passo',
    traps: ['Uma vez não vai fazer diferença', 'Pelo menos a noite fica animada'],
  },
  {
    text: 'Só vou dar uma passada lá',
    strong: 'Passar lá já é a decisão. Vou pelo outro caminho',
    traps: ['Passar não é usar', 'Vou só ver quem está lá'],
  },
  {
    text: 'Com uma cerveja não tem problema',
    strong: 'Álcool abre a porta. Hoje é sem os dois',
    traps: ['Uma só para acompanhar', 'Cerveja é diferente'],
  },
  {
    text: 'Estou mal, preciso de algo',
    strong: 'Estou mal e vai passar. Comer, banho e falar com alguém ajudam de verdade',
    traps: ['Só hoje para aguentar', 'Depois eu cuido disso'],
  },
  {
    text: 'Já está tarde, que se dane',
    strong: 'Tarde é hora de dormir. Amanhã eu agradeço',
    traps: ['A noite já está perdida mesmo', 'Amanhã eu durmo mais'],
  },
];

export interface RebateQuestion {
  thought: string;
  options: string[];
  correct: string;
}

export const ROUND_THOUGHTS = 6;
export const ANSWER_MS = 8000;

/**
 * Monta uma rodada. `personal` mapeia pensamento → resposta escrita pela pessoa no treino; ela
 * substitui a resposta padrão (as próprias palavras pesam mais).
 */
export function buildRound(rng: Rng, personal: Readonly<Record<string, string>> = {}, size = ROUND_THOUGHTS): RebateQuestion[] {
  return shuffle(THOUGHTS, rng)
    .slice(0, size)
    .map((t) => {
      const correct = personal[t.text]?.trim() || t.strong;
      const options = [...new Set([correct, ...t.traps, t.strong])].slice(0, 3);
      return { thought: t.text, correct, options: shuffle(options, rng) };
    });
}

export function scoreAnswer(correct: boolean, msLeft: number, streak: number): number {
  if (!correct) return 0;
  return 100 + Math.round((Math.max(0, msLeft) / ANSWER_MS) * 50) + Math.min(streak, 5) * 10;
}

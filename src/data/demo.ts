/**
 * Modo demonstração (`?demo` no link): dados de exemplo só na memória, para mostrar o app a
 * alguém (jurados, profissionais de saúde) sem expor nem tocar nos dados reais do celular.
 */
import { ALL_STEPS } from '@/domain/routine';
import { addDays, toLocalDate } from '@/domain/dates';
import { createRng } from '@/domain/games/rng';
import { xpForGame, type GameId } from '@/domain/progression';
import { createLocalRepositories, type KeyValueStorage } from './repositories/local';
import type { Repositories } from './repositories/types';

export function isDemo(search: string): boolean {
  return new URLSearchParams(search).has('demo');
}

function memory(): KeyValueStorage {
  const data = new Map<string, string>();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const at = (date: string, hour: number, minute = 0) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute);
};

export function createDemoRepositories(today = new Date()): Repositories {
  let clock = today;
  let n = 0;
  const repos = createLocalRepositories({ storage: memory(), newId: () => `demo-${++n}`, now: () => clock });
  const rng = createRng(2026);
  const todayStr = toLocalDate(today);
  const start = addDays(todayStr, -20);
  const days = Array.from({ length: 21 }, (_, i) => addDays(start, i));
  const useDays = new Set([days[3], days[11]]);

  repos.settings.set('onboardingDone', true);
  repos.settings.set('supportFocus', 'general');
  repos.settings.set('trackingStartDate', start);
  repos.settings.set('workEndTime', '18:00');
  repos.settings.set('weeklySpending', 250);
  repos.settings.set('routineStyle', 'magica');
  repos.settings.set('letter', 'Ei, eu sei que está pesado agora. Você não precisa resolver tudo hoje. Faça uma pausa, tome água e procure alguém de confiança, se puder. Você merece cuidado também nos dias difíceis.');
  repos.settings.set('lastBackupAt', at(addDays(todayStr, -3), 21).toISOString());

  repos.plan.add({ kind: 'razao', text: 'Acordar inteiro para o trabalho' });
  repos.plan.add({ kind: 'razao', text: 'Juntar dinheiro para viajar' });
  repos.plan.add({ kind: 'gatilho', text: 'Sair do trabalho sozinho e entediado' });
  repos.plan.add({ kind: 'se_entao', text: 'Se eu sair do trabalho com vontade, então vou direto para a academia' });
  repos.plan.add({ kind: 'atividade', text: 'Cozinhar um jantar de verdade' });
  const gym = repos.plan.add({ kind: 'plano_noite', text: 'Academia', extra: { firstStep: 'Mochila pronta no carro' } });
  const series = repos.plan.add({ kind: 'plano_noite', text: 'Série com pizza', extra: { firstStep: 'Pedir às 19h' } });
  repos.plan.add({ kind: 'filme', text: 'Acordo às 6h destruído, sem dinheiro e mentindo no trabalho' });
  repos.plan.add({ kind: 'futuro', text: 'Viajando com o dinheiro que antes sumia em uma noite' });
  repos.plan.add({ kind: 'resposta', text: 'Mereço é acordar bem amanhã', extra: { thought: 'Só hoje, eu mereço' } });

  const copings = ['jogo:blocos', 'jogo:onda', 'sair', 'jogo:pares', 'agua_fria', 'jogo:blocos'];
  const games: GameId[] = ['blocos', 'pares', 'onda', 'noite'];
  days.forEach((date, i) => {
    clock = at(date, 22);
    const used = useDays.has(date);
    const alcohol = used || rng() < 0.15;
    repos.checkins.upsertForDate({
      date,
      mood: used ? 2 : 3 + Math.floor(rng() * 3),
      craving: used ? 8 : Math.max(1, 6 - Math.floor(i / 5) - Math.floor(rng() * 2)),
      sleepQuality: 2 + Math.floor(rng() * 4),
      stress: 2 + Math.floor(rng() * 3),
      alcohol,
      used,
      note: null,
    });
    if (used) repos.useEvents.add({ occurredAt: at(date, 23, 30).toISOString(), amountSpent: 150, note: null });
    if (i % 2 === 0 || used) {
      const intensity = 6 + Math.floor(rng() * 4);
      const coping = copings[i % copings.length];
      const drop = coping.startsWith('jogo:') ? 3 + Math.floor(rng() * 2) : 1 + Math.floor(rng() * 2);
      repos.cravings.add({
        occurredAt: at(date, 19, 10).toISOString(),
        intensity,
        intensityAfter: used ? intensity : Math.max(0, intensity - drop),
        trigger: null,
        coping,
        outcome: used ? 'usei' : 'passou',
        note: null,
      });
    }
    if (i % 3 !== 2) {
      repos.evenings.choose(date, (i % 2 ? series : gym).id);
      if (date !== todayStr) repos.evenings.setOutcome(date, used ? 'usei' : 'sem_uso');
    }
    const game = games[i % games.length];
    const score = Math.round((game === 'blocos' ? 900 : 400) * (0.6 + rng() * 0.8));
    repos.games.add({ date, gameId: game, score, xp: xpForGame(game, score), durationMs: 120000, extra: null });
    if (i % 4 === 1) repos.practices.add(['se_entao', 'surfar', 'filme', 'pensamentos', 'futuro', 'acesso'][i % 6], date);
    // Régua de 0 a 10 de vez em quando, com a confiança subindo devagar.
    if (i % 7 === 3) repos.practices.add('regua', date, { importancia: 8, confianca: 3 + Math.floor(i / 7) });
  });
  repos.plan.add({ kind: 'sinal_alerta', text: 'sacar dinheiro na sexta "por garantia"', extra: null });
  clock = today;
  // Rotina e Diário: dias com parte da rotina feita e o diário da noite.
  const tricks = ['Só uma vez, ninguém vai saber', 'Você merece depois dessa semana', null];
  days.forEach((date, i) => {
    if (i === days.length - 1) return;
    clock = at(date, 22);
    ALL_STEPS.forEach((s) => rng() < (useDays.has(date) ? 0.3 : 0.7) && repos.routine.toggle(date, s.id, true));
    const craving = useDays.has(date) ? 8 : Math.floor(rng() * 6) + 1;
    repos.journal.upsert({
      date,
      craving,
      triggers: craving > 4 ? ['Tédio', 'Cansaço'] : ['Estresse'],
      breaks: Math.floor(rng() * 4),
      trick: tricks[i % 3],
      victory: craving > 4 ? 'Respirei 4-4-4-4 e fui para o banho' : null,
    });
  });
  clock = at(addDays(todayStr, -2), 20);
  repos.thoughts.add({ body: ['Cansaço'], feelings: ['Tédio', 'Solidão'], thought: 'Só hoje, eu mereço depois dessa semana', traps: ['permissao'], answer: 'Merecer é acordar bem amanhã. A vontade passa.', best: 'Banho e jantar' });
  clock = at(addDays(todayStr, -1), 19);
  repos.thoughts.add({ body: ['Fome'], feelings: ['Raiva'], thought: 'Nunca vou conseguir parar', traps: ['sempre_nunca', 'rotulo'], answer: 'Já passei várias noites sem usar este mês.', best: 'Comer e ligar para o meu irmão' });
  clock = today;
  repos.routine.toggle(todayStr, 'm_ra', true);
  repos.routine.toggle(todayStr, 'm_asana', true);
  repos.routine.toggle(todayStr, 'm_juramento', true);

  return repos;
}

import type { Repositories } from '@/data/repositories/types';
import type { LocalDate } from './dates';

export type SupportFocus = 'general' | 'recovery';

/** Novos usuários entram no acolhimento geral. Instalações antigas conservam suas ferramentas e métricas. */
export function supportFocus(repos: Pick<Repositories, 'settings'>): SupportFocus {
  const saved = repos.settings.get<SupportFocus | null>('supportFocus', null);
  if (saved === 'general' || saved === 'recovery') return saved;
  return repos.settings.get('onboardingDone', false) ? 'recovery' : 'general';
}

/** Usa campos já existentes de humor/estresse; não transforma fissura ou episódios antigos em outro indicador. */
export function saveWellbeingCheckin(repos: Repositories, date: LocalDate, input: { mood: number | null; stress: number | null; note: string | null }) {
  const previous = repos.checkins.getByDate(date);
  return repos.checkins.upsertForDate({ date, ...input, craving: previous?.craving ?? null, used: previous?.used ?? null, alcohol: previous?.alcohol ?? null, sleepQuality: previous?.sleepQuality ?? null });
}

import type { Repositories } from '@/data/repositories/types';
import { toLocalDate } from '@/domain/dates';
import { rankStrategies } from '@/domain/strategies';
import { DEFAULT_ACTIONS, type SosAction } from './defaults';

export interface KitEntry {
  label: string;
  text: string;
}

/**
 * O que o "eu calmo" preparou, para o SOS mostrar: frases escritas nos treinos e razões.
 * Mostra o mais recente de cada tipo para não virar um muro de texto na crise.
 */
export function readKit(repos: Repositories): KitEntry[] {
  const latest = (kind: Parameters<Repositories['plan']['list']>[0]) => repos.plan.list(kind).at(-1);
  const out: KitEntry[] = [];
  const filme = latest('filme');
  if (filme) out.push({ label: 'Você escreveu como essa noite termina', text: filme.text });
  const resposta = latest('resposta');
  if (resposta) out.push({ label: `Quando pensar "${String(resposta.extra?.thought ?? '…')}"`, text: resposta.text });
  const recusa = latest('recusa');
  if (recusa) out.push({ label: 'Se oferecerem', text: recusa.text });
  const futuro = latest('futuro');
  if (futuro) out.push({ label: 'Daqui a 6 meses', text: futuro.text });
  const reasons = repos.plan.list('razao').map((r) => r.text);
  if (reasons.length) out.push({ label: 'Por que você quer parar', text: reasons.join(' · ') });
  const people = repos.plan.list('pessoa').map((p) => p.text);
  if (people.length) out.push({ label: 'Quem você pode chamar', text: people.join(' · ') });
  return out;
}

/** Ações do SOS: plano da noite, seus "se… então…" e as padrão, na ordem do que mais funcionou. */
export function readActions(repos: Repositories): SosAction[] {
  const today = toLocalDate(new Date());
  const choice = repos.evenings.getForDate(today);
  const plan = choice ? repos.plan.list('plano_noite').find((p) => p.id === choice.planItemId) : undefined;
  const personal: SosAction[] = repos.plan.list('se_entao').map((i) => ({ id: `plano:${i.id}`, text: i.text }));
  const tonight: SosAction[] = plan
    ? [{ id: `noite:${plan.text}`, text: `Seu plano de hoje: ${plan.text}. ${String(plan.extra?.firstStep ?? '')}`.trim() }]
    : [];
  const history = repos.cravings.listBetween('2000-01-01', '2999-12-31');
  return [...tonight, ...rankStrategies([...personal, ...DEFAULT_ACTIONS], history)];
}

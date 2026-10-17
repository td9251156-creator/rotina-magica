import type { RoutineStep } from '@/domain/routine';
import type { IconId } from '@/ui/app-icons';
import { Icon } from '@/ui/icons';

/** Um ícone por passo; serve à rotina com ou sem ritual, que usam os mesmos ids. */
const BY_ID: Record<string, IconId> = {
  m_ra: 'passo_amanhecer',
  m_asana: 'passo_respirar',
  m_rmp: 'passo_protecao',
  m_juramento: 'passo_compromisso',
  t_ahathoor: 'passo_meio_dia',
  t_gatilho: 'passo_vontade',
  n_tum: 'passo_chegar',
  n_rmp: 'passo_limpeza',
  n_pilar: 'passo_luz',
  n_diario: 'passo_escrever',
  n_khephra: 'passo_fechar',
};

export function StepIcon({ step }: { step: RoutineStep }) {
  return <Icon id={BY_ID[step.id] ?? 'passo_amanhecer'} />;
}

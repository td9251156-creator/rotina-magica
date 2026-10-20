import type { Repositories } from '@/data/repositories/types';
import type { EveningPlanDraft } from '@/domain/evening';
import type { SupportFocus } from '@/domain/support';

export interface OnboardingAnswers {
  supportFocus?: SupportFocus;
  workEndTime: string;
  activityIds: string[];
  customActivities: string[];
  reasons: string[];
  plans: EveningPlanDraft[];
}

/** Grava as respostas do primeiro uso. Rodar de novo substitui razões, atividades e planos. */
export function completeOnboarding(repos: Repositories, answers: OnboardingAnswers): void {
  const { plan, settings } = repos;

  for (const kind of ['razao', 'atividade', 'plano_noite'] as const) {
    for (const item of plan.list(kind)) plan.remove(item.id);
  }

  answers.reasons.forEach((text) => plan.add({ kind: 'razao', text }));
  answers.activityIds.forEach((id) => plan.add({ kind: 'atividade', text: id, extra: { catalog: true } }));
  answers.customActivities.forEach((text) => plan.add({ kind: 'atividade', text, extra: { catalog: false } }));
  answers.plans.forEach((p) =>
    plan.add({
      kind: 'plano_noite',
      text: p.title,
      extra: { firstStep: p.firstStep, leavesHome: p.leavesHome, activityId: p.activityId },
    }),
  );

  settings.set('workEndTime', answers.workEndTime);
  if (answers.supportFocus) settings.set('supportFocus', answers.supportFocus);
  settings.set('onboardingDone', true);
}

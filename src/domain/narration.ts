/**
 * Narração gravada além das práticas guiadas: avisos curtos das fases sem roteiro (ex.: "Inspire") e
 * os passos de Terapias e vivências. Os arquivos são gerados por scripts/gerar-narracao.py (--extras),
 * a partir de scripts/narracao-textos.ts, e ficam em public/audio/. Sem arquivo, o app usa a voz do celular.
 */
import { PRACTICES, phaseSpeech, type PracticePhase } from './routine';
import { TECHNIQUES } from './training';

export interface SpokenFile {
  /** Caminho dentro de public/audio/. */
  path: string;
  text: string;
}

/** Aviso falado de uma fase sem roteiro: com a dica só quando dá tempo de ouvir antes da próxima fase. */
export function cueText(phase: PracticePhase): string {
  return phase.seconds >= 6 ? phaseSpeech(phase) : phase.label;
}

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function cueFile(phase: PracticePhase): string {
  return `cues/${slug(cueText(phase))}.mp3`;
}

export function trainingFile(techniqueId: string, step: number): string {
  return `training/${techniqueId}-${step}.mp3`;
}

/** Tudo o que é narrado fora do roteiro das práticas, sem repetir o mesmo aviso. */
export function extraNarration(): SpokenFile[] {
  const out = new Map<string, string>();
  for (const p of Object.values(PRACTICES))
    for (const phase of p.phases) if (!phase.guide) out.set(cueFile(phase), cueText(phase));
  for (const t of TECHNIQUES) t.steps.forEach((s, i) => out.set(trainingFile(t.id, i), s.text));
  return [...out].map(([path, text]) => ({ path, text }));
}

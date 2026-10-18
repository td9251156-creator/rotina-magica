/**
 * "Surfar a fissura": a vontade sobe, chega a um pico e passa, normalmente em minutos.
 * O timer dá um horizonte concreto; a respiração lenta (expiração mais longa que a inspiração)
 * ajuda a baixar a ativação enquanto a onda passa.
 */
export const URGE_WAVE_MS = 15 * 60 * 1000;

export type BreathStep = 'inspire' | 'segure' | 'solte';

const CYCLE: readonly { step: BreathStep; ms: number }[] = [
  { step: 'inspire', ms: 4000 },
  { step: 'segure', ms: 2000 },
  { step: 'solte', ms: 6000 },
];
const CYCLE_MS = CYCLE.reduce((sum, s) => sum + s.ms, 0);

export function breathAt(elapsedMs: number): { step: BreathStep; progress: number } {
  let t = ((elapsedMs % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  for (const { step, ms } of CYCLE) {
    if (t < ms) return { step, progress: t / ms };
    t -= ms;
  }
  return { step: 'inspire', progress: 0 };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Ponto do pico na onda desenhada (fração dos 15 minutos). */
export const WAVE_PEAK = 0.3;

/**
 * Altura da onda da vontade (0 a 1) no instante `t` (0 a 1 dos 15 minutos): sobe rápido, chega ao
 * pico e desce devagar, como a vontade costuma fazer. É um desenho para dar horizonte, não uma medida.
 */
export function waveHeight(t: number): number {
  const x = Math.min(1, Math.max(0, t)) / WAVE_PEAK;
  return x ** 2 * Math.exp(2 * (1 - x));
}

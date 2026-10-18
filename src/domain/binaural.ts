/**
 * Sons binaurais para relaxar: cada ouvido recebe um tom um pouco diferente e o cérebro percebe uma
 * pulsação lenta na diferença entre os dois. Só funciona com fone de ouvido.
 *
 * As três faixas seguem os estudos com mais base, com a portadora grave e confortável que eles usaram:
 * - alfa 10 Hz: calma acordada. Uma revisão de 22 estudos (Garcia-Argibay e colegas, 2019) achou
 *   efeito pequeno a moderado na ansiedade.
 * - teta 6 Hz: relaxamento profundo, parecido com meditação (Jirakittayakorn e Wongsawat, 2017).
 * - delta 3 Hz, portadora 250 Hz: mais tempo de sono profundo (Jirakittayakorn e Wongsawat, 2018).
 * Teta e delta começam em alfa e descem devagar, para o corpo ir junto em vez de levar um tranco.
 */
export type BinauralId = 'calma' | 'fundo' | 'sono';

export interface BinauralPreset {
  id: BinauralId;
  title: string;
  /** Faixa de ondas cerebrais, para quem quiser saber. */
  band: string;
  /** Pulsação final, em Hz (diferença entre os ouvidos). */
  beat: number;
  /** Pulsação no começo; desce até `beat` em `glideSeconds`. */
  startBeat: number;
  glideSeconds: number;
  /** Tom central, em Hz: grave, abaixo da voz. */
  carrier: number;
  minutes: number;
  when: string;
  evidence: string;
}

export const BINAURAL_PRESETS: readonly BinauralPreset[] = [
  {
    id: 'calma',
    title: 'Calma acordada',
    band: 'alfa · 10 Hz',
    beat: 10,
    startBeat: 10,
    glideSeconds: 0,
    carrier: 200,
    minutes: 15,
    when: 'Para baixar a agitação sem dar sono: depois do trabalho, antes de uma conversa difícil.',
    evidence: 'Uma revisão de 22 estudos (2019) achou efeito pequeno a moderado na ansiedade.',
  },
  {
    id: 'fundo',
    title: 'Relaxar fundo',
    band: 'teta · 6 Hz',
    beat: 6,
    startBeat: 10,
    glideSeconds: 180,
    carrier: 180,
    minutes: 20,
    when: 'Deitado ou sentado, de olhos fechados, quando der para se desligar um pouco.',
    evidence: 'Num estudo de 2017, 6 Hz levou o cérebro a um estado parecido com o da meditação.',
  },
  {
    id: 'sono',
    title: 'Pegar no sono',
    band: 'delta · 3 Hz',
    beat: 3,
    startBeat: 10,
    glideSeconds: 300,
    carrier: 250,
    minutes: 30,
    when: 'Na cama, com a luz apagada. O som some sozinho no fim.',
    evidence: 'Num estudo de 2018, 3 Hz aumentou o tempo de sono profundo.',
  },
];

export const SAFETY_NOTE =
  'Use fone de ouvido e volume baixo. Não use dirigindo. Se você tem epilepsia, fale antes com seu médico. A pesquisa ainda é pequena: pode ajudar a relaxar, mas não é tratamento.';

export function findPreset(id: string): BinauralPreset | undefined {
  return BINAURAL_PRESETS.find((p) => p.id === id);
}

/** Tom de cada ouvido: a portadora fica no meio e a diferença entre os dois é a pulsação. */
export function earFrequencies(carrier: number, beat: number): { left: number; right: number } {
  return { left: carrier - beat / 2, right: carrier + beat / 2 };
}

/** Pulsação no segundo `s`: desce em linha reta de `startBeat` até `beat` e fica. */
export function beatAt(preset: BinauralPreset, s: number): number {
  if (preset.glideSeconds <= 0 || s >= preset.glideSeconds) return preset.beat;
  const k = Math.max(0, s) / preset.glideSeconds;
  return preset.startBeat + (preset.beat - preset.startBeat) * k;
}

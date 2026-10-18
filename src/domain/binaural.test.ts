import { describe, expect, it } from 'vitest';
import { BINAURAL_PRESETS, beatAt, earFrequencies, findPreset } from './binaural';

describe('sons binaurais', () => {
  it('a diferença entre os ouvidos é a pulsação, com a portadora no meio', () => {
    const { left, right } = earFrequencies(200, 10);
    expect(right - left).toBe(10);
    expect((left + right) / 2).toBe(200);
  });

  it('as faixas ficam onde os estudos medem e a portadora é grave e confortável', () => {
    const bands: Record<string, [number, number]> = { calma: [8, 13], fundo: [4, 8], sono: [0.5, 4] };
    for (const p of BINAURAL_PRESETS) {
      const [lo, hi] = bands[p.id];
      expect(p.beat).toBeGreaterThanOrEqual(lo);
      expect(p.beat).toBeLessThan(hi);
      // Acima de ~1000 Hz a pulsação some; abaixo de 100 Hz o tom vira zumbido.
      expect(p.carrier).toBeGreaterThanOrEqual(100);
      expect(p.carrier).toBeLessThanOrEqual(500);
      expect(p.glideSeconds).toBeLessThan(p.minutes * 60);
    }
  });

  it('teta e delta começam em alfa e descem devagar até a faixa', () => {
    const sono = findPreset('sono')!;
    expect(beatAt(sono, 0)).toBe(10);
    expect(beatAt(sono, sono.glideSeconds / 2)).toBeCloseTo(6.5);
    expect(beatAt(sono, sono.glideSeconds)).toBe(3);
    expect(beatAt(sono, 9999)).toBe(3);
    expect(beatAt(findPreset('calma')!, 0)).toBe(10);
  });
});

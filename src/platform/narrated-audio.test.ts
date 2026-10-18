import { afterEach, describe, expect, it, vi } from 'vitest';
import { playNarration, stopNarratedAudio } from './narrated-audio';

/** Áudio falso: `play` só termina quando o teste manda, e falha se for pausado antes, como no Chrome. */
class FakeAudio {
  static all: FakeAudio[] = [];
  preload = '';
  currentTime = 0;
  private reject?: (e: Error) => void;
  resolve?: () => void;
  constructor(public src: string) {
    FakeAudio.all.push(this);
  }
  play() {
    return new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  pause() {
    this.reject?.(new Error('AbortError'));
  }
  fail() {
    this.reject?.(new Error('NotSupportedError'));
  }
}

describe('narração gravada', () => {
  afterEach(() => {
    FakeAudio.all = [];
    vi.unstubAllGlobals();
  });

  it('um arquivo interrompido por outro não conta como falha (sem voz do celular por cima)', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    const first = playNarration('cues/inspire.mp3');
    const second = playNarration('cues/expire.mp3');
    FakeAudio.all[1].resolve?.();
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
  });

  it('desligar a voz no meio do carregamento também não chama a voz reserva', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    const p = playNarration('cues/inspire.mp3');
    stopNarratedAudio();
    await expect(p).resolves.toBe(true);
  });

  it('arquivo que não toca devolve false, para a voz do celular assumir', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    const p = playNarration('cues/inexistente.mp3');
    FakeAudio.all[0].fail();
    await expect(p).resolves.toBe(false);
  });
});

/**
 * Áudios narrados são arquivos estáticos opcionais. Enquanto eles não forem publicados,
 * a prática usa a voz local do aparelho como antes.
 */
import { narratedFiles } from '@/domain/routine';

let current: HTMLAudioElement | null = null;

export function narratedAudioUrl(practiceId: string, phaseIndex: number): string {
  const base = import.meta.env.BASE_URL;
  return `${base}audio/practices/${encodeURIComponent(practiceId)}-${phaseIndex}.mp3`;
}

export function stopNarratedAudio(): void {
  current?.pause();
  current = null;
}

/**
 * Tenta tocar um arquivo local, a partir de `from` segundos (quando a voz é ligada no meio da fase);
 * retorna false quando o arquivo não existe ou o navegador não toca áudio.
 */
export function playNarratedAudio(practiceId: string, phaseIndex: number, from = 0): Promise<boolean> {
  if (typeof Audio === 'undefined') return Promise.resolve(false);
  stopNarratedAudio();
  const audio = new Audio(narratedAudioUrl(practiceId, phaseIndex));
  current = audio;
  audio.preload = 'auto';
  if (from > 0) audio.currentTime = from;
  const playing = audio.play() as Promise<void> | undefined;
  if (!playing) return Promise.resolve(false);
  return playing
    .then(() => true)
    .catch(() => {
      if (current === audio) current = null;
      return false;
    });
}

let prefetch: 'parado' | 'baixando' | 'pronto' = 'parado';

/**
 * Baixa toda a narração (cerca de 2 MB) quando a pessoa liga a voz, para o service worker guardar:
 * assim a voz também funciona sem internet, inclusive na Ajuda agora. Um arquivo por vez, sem pressa.
 */
export async function prefetchNarration(): Promise<void> {
  if (prefetch !== 'parado' || typeof fetch === 'undefined') return;
  prefetch = 'baixando';
  const base = import.meta.env.BASE_URL;
  for (const file of narratedFiles()) {
    try {
      await fetch(`${base}audio/practices/${file}`);
    } catch {
      prefetch = 'parado'; // sem internet: tenta de novo na próxima prática com voz
      return;
    }
  }
  prefetch = 'pronto';
}

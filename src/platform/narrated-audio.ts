/**
 * Áudios narrados são arquivos estáticos opcionais. Enquanto eles não forem publicados,
 * a prática usa a voz local do aparelho como antes.
 */
import { narratedFiles } from '@/domain/routine';
import { extraNarration } from '@/domain/narration';

let current: HTMLAudioElement | null = null;

export function narratedAudioUrl(practiceId: string, phaseIndex: number): string {
  return audioUrl(`practices/${encodeURIComponent(practiceId)}-${phaseIndex}.mp3`);
}

/** Endereço de um arquivo de public/audio/ (ex.: `cues/inspire.mp3`). */
export function audioUrl(path: string): string {
  return `${import.meta.env.BASE_URL}audio/${path}`;
}

export function stopNarratedAudio(): void {
  current?.pause();
  current = null;
}

/**
 * Tenta tocar um arquivo local, a partir de `from` segundos (quando a voz é ligada no meio da fase);
 * retorna false quando o arquivo não existe ou o navegador não toca áudio (nunca quando foi parado de propósito).
 */
export function playNarratedAudio(practiceId: string, phaseIndex: number, from = 0): Promise<boolean> {
  return playAudioFile(narratedAudioUrl(practiceId, phaseIndex), from);
}

/** Toca um arquivo de public/audio/ pelo caminho; false quando ele não existe. */
export function playNarration(path: string, from = 0): Promise<boolean> {
  return playAudioFile(audioUrl(path), from);
}

function playAudioFile(url: string, from: number): Promise<boolean> {
  if (typeof Audio === 'undefined') return Promise.resolve(false);
  stopNarratedAudio();
  const audio = new Audio(url);
  current = audio;
  audio.preload = 'auto';
  if (from > 0) audio.currentTime = from;
  const playing = audio.play() as Promise<void> | undefined;
  if (!playing) return Promise.resolve(false);
  return playing
    .then(() => true)
    .catch(() => {
      // Parado de propósito (a fase mudou, a voz foi desligada ou outra fala começou): não é falha,
      // e a voz do celular não pode entrar por cima do arquivo seguinte.
      if (current !== audio) return true;
      current = null;
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
  // Práticas e avisos curtos; os passos das vivências ficam guardados quando são ouvidos.
  const files = [...narratedFiles().map((f) => `practices/${f}`), ...extraNarration().filter((f) => f.path.startsWith('cues/')).map((f) => f.path)];
  for (const file of files) {
    try {
      await fetch(audioUrl(file));
    } catch {
      prefetch = 'parado'; // sem internet: tenta de novo na próxima prática com voz
      return;
    }
  }
  prefetch = 'pronto';
}

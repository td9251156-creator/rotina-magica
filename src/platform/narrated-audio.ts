/**
 * Áudios narrados são arquivos estáticos opcionais. Enquanto eles não forem publicados,
 * a prática usa a voz local do aparelho como antes.
 */
let current: HTMLAudioElement | null = null;

export function narratedAudioUrl(practiceId: string, phaseIndex: number): string {
  const base = import.meta.env.BASE_URL;
  return `${base}audio/practices/${encodeURIComponent(practiceId)}-${phaseIndex}.mp3`;
}

export function stopNarratedAudio(): void {
  current?.pause();
  current = null;
}

/** Tenta tocar um arquivo local; retorna false quando o navegador não tem áudio disponível. */
export function playNarratedAudio(practiceId: string, phaseIndex: number): Promise<boolean> {
  if (typeof Audio === 'undefined') return Promise.resolve(false);
  stopNarratedAudio();
  const audio = new Audio(narratedAudioUrl(practiceId, phaseIndex));
  current = audio;
  audio.preload = 'auto';
  return audio
    .play()
    .then(() => true)
    .catch(() => {
      if (current === audio) current = null;
      return false;
    });
}

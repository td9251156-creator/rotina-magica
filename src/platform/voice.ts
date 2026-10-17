/**
 * Voz do próprio celular (Web Speech) para guiar as práticas. Funciona sem internet quando o
 * Android tem a voz em português instalada, e nada sai do aparelho. Sem suporte, fica em silêncio.
 */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function ptVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'pt-BR' && v.localService) ?? voices.find((v) => v.lang === 'pt-BR') ?? voices.find((v) => v.lang.startsWith('pt'));
}

/** Fala o texto devagar e com calma, interrompendo o que estava falando antes. */
export function speak(text: string): void {
  if (!canSpeak() || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  u.rate = 0.85;
  u.pitch = 0.95;
  const v = ptVoice();
  if (v) u.voice = v;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

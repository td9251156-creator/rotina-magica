/**
 * Voz do próprio celular (Web Speech) para guiar as práticas. Funciona sem internet quando o
 * Android tem a voz em português instalada, e nada sai do aparelho. Sem suporte, fica em silêncio.
 * O ritmo segue uma meditação guiada: frases curtas, voz baixa e devagar, silêncio entre elas.
 */
import { voiceScript } from '@/domain/routine';

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function ptVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'pt-BR' && v.localService) ?? voices.find((v) => v.lang === 'pt-BR') ?? voices.find((v) => v.lang.startsWith('pt'));
}

let run = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

/** Fala o texto em frases curtas com pausas, interrompendo o que estava falando antes. */
export function speak(text: string): void {
  if (!canSpeak() || !text) return;
  stopSpeaking();
  const id = ++run;
  const lines = voiceScript(text);
  const next = (i: number) => {
    if (id !== run || i >= lines.length) return;
    const u = new SpeechSynthesisUtterance(lines[i].text);
    u.lang = 'pt-BR';
    u.rate = 0.8;
    u.pitch = 0.9;
    const v = ptVoice();
    if (v) u.voice = v;
    u.onend = () => {
      if (id === run) timer = setTimeout(() => next(i + 1), lines[i].pauseMs);
    };
    window.speechSynthesis.speak(u);
  };
  next(0);
}

export function stopSpeaking(): void {
  run++;
  clearTimeout(timer);
  if (canSpeak()) window.speechSynthesis.cancel();
}

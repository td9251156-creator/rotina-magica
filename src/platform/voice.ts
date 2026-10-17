/**
 * Voz do próprio celular (Web Speech) para guiar as práticas. Funciona sem internet quando o
 * Android tem a voz em português instalada, e nada sai do aparelho. Sem suporte, fica em silêncio.
 * O ritmo segue uma meditação guiada: frases curtas, voz baixa e devagar, silêncio entre elas.
 */
import { voiceScript, type SpokenLine } from '@/domain/routine';

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

// Os áudios de referência têm voz masculina grave; quando o aparelho oferece uma, ela vem primeiro.
const MALE = /ant[oô]nio|daniel|felipe|f[aá]bio|humberto|j[uú]lio|val[eé]rio|donato|nicolau|thiago|\bmale|masculin/i;

function ptVoice() {
  const pt = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('pt'));
  const br = pt.filter((v) => /br$/i.test(v.lang));
  const pool = br.length ? br : pt;
  return (
    pool.find((v) => v.localService && MALE.test(v.name)) ??
    pool.find((v) => v.localService) ??
    pool.find((v) => MALE.test(v.name)) ??
    pool[0]
  );
}

let run = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

/** Fala as frases uma a uma, com o silêncio de cada uma; nomes vibrados saem bem devagar e graves. */
export function speakLines(lines: readonly SpokenLine[]): void {
  if (!canSpeak() || !lines.length) return;
  stopSpeaking();
  const id = ++run;
  const voice = ptVoice();
  const next = (i: number) => {
    if (id !== run || i >= lines.length) return;
    const line = lines[i];
    const u = new SpeechSynthesisUtterance(line.text);
    u.lang = 'pt-BR';
    u.rate = line.intone ? 0.45 : 0.8;
    u.pitch = line.intone ? 0.7 : 0.85;
    if (voice) u.voice = voice;
    u.onend = () => {
      if (id === run) timer = setTimeout(() => next(i + 1), line.pauseMs);
    };
    window.speechSynthesis.speak(u);
  };
  next(0);
}

export function speak(text: string): void {
  speakLines(voiceScript(text));
}

export function stopSpeaking(): void {
  run++;
  clearTimeout(timer);
  if (canSpeak()) window.speechSynthesis.cancel();
}

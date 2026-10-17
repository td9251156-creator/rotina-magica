/**
 * Som de fundo das práticas: um acorde suave e contínuo, gerado no aparelho (Web Audio), sem
 * arquivo nem internet. Copia o fundo dos áudios de meditação guiada de referência: notas de
 * dó menor com sétima (dó, mi bemol, sol, si bemol), bem abaixo da voz, subindo e descendo devagar.
 */
export const AMBIENT_NOTES = [130.81, 155.56, 196.0, 233.08, 261.63, 392.0] as const;
const LEVEL = 0.045;

type Ctor = typeof AudioContext;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sway: GainNode | null = null;
let sources: OscillatorNode[] = [];

function audioContext(): Ctor | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
}

export function canPlayAmbient(): boolean {
  return Boolean(audioContext());
}

export function startAmbient(): void {
  const Ctx = audioContext();
  if (!Ctx || master) return;
  ctx ??= new Ctx();
  void ctx.resume();
  const t = ctx.currentTime;
  master = ctx.createGain();
  master.gain.setValueAtTime(0, t);
  master.gain.linearRampToValueAtTime(LEVEL, t + 4);
  const soft = ctx.createBiquadFilter();
  soft.type = 'lowpass';
  soft.frequency.value = 900;
  soft.connect(master);
  master.connect(ctx.destination);
  // O volume "respira": sobe e desce um pouco a cada 12 segundos.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 1 / 12;
  sway = ctx.createGain();
  sway.gain.value = LEVEL * 0.25;
  lfo.connect(sway);
  sway.connect(master.gain);
  lfo.start(t);
  sources = [lfo];
  AMBIENT_NOTES.forEach((freq, i) => {
    // Duas vozes levemente desafinadas por nota dão o brilho lento de um coro.
    for (const detune of [-4, 4]) {
      const osc = ctx!.createOscillator();
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx!.createGain();
      g.gain.value = 0.35 / (i + 1);
      osc.connect(g);
      g.connect(soft);
      osc.start(t);
      sources.push(osc);
    }
  });
}

export function stopAmbient(): void {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  for (const g of [master, sway]) {
    g?.gain.cancelScheduledValues(t);
    g?.gain.setValueAtTime(g.gain.value, t);
    g?.gain.linearRampToValueAtTime(0, t + 2);
  }
  for (const s of sources) s.stop(t + 2.1);
  master = null;
  sway = null;
  sources = [];
}

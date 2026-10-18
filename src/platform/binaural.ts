/**
 * Toca os sons binaurais no aparelho (Web Audio): um tom só no ouvido esquerdo, outro só no direito,
 * e uma chuva suave (ruído rosa) bem baixa por baixo, que deixa o tom menos "de laboratório".
 * Sem arquivo e sem internet; a frequência é exata.
 */
import { beatAt, earFrequencies, type BinauralPreset } from '@/domain/binaural';

const TONE = 0.08;
const RAIN = 0.035;
const FADE_IN = 6;
const FADE_OUT = 3;
/** No fim, o som some devagar em vez de cortar. */
const END_FADE = 60;

type Ctor = typeof AudioContext;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sources: AudioScheduledSourceNode[] = [];

function audioContext(): Ctor | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
}

export function canPlayBinaural(): boolean {
  return Boolean(audioContext());
}

/** Ruído rosa (filtro de Paul Kellet): mais grave que o branco, soa como chuva. */
function pinkNoise(c: AudioContext, seconds = 8): AudioBuffer {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

/** Começa a tocar; para sozinho depois de `minutes`, sumindo devagar no último minuto. */
export function startBinaural(preset: BinauralPreset, minutes = preset.minutes, rain = true): void {
  const Ctx = audioContext();
  if (!Ctx) return;
  stopBinaural(0);
  ctx ??= new Ctx();
  void ctx.resume();
  const t = ctx.currentTime;
  const end = t + minutes * 60;
  master = ctx.createGain();
  master.gain.setValueAtTime(0, t);
  master.gain.linearRampToValueAtTime(1, t + FADE_IN);
  master.gain.setValueAtTime(1, Math.max(t + FADE_IN, end - END_FADE));
  master.gain.linearRampToValueAtTime(0, end);
  master.connect(ctx.destination);

  // Canal 0 = ouvido esquerdo, canal 1 = direito, sem nada vazar de um para o outro.
  const ears = ctx.createChannelMerger(2);
  ears.connect(master);
  const start = earFrequencies(preset.carrier, beatAt(preset, 0));
  const target = earFrequencies(preset.carrier, preset.beat);
  sources = (['left', 'right'] as const).map((side, channel) => {
    const osc = ctx!.createOscillator();
    osc.frequency.setValueAtTime(start[side], t);
    if (preset.glideSeconds > 0) osc.frequency.linearRampToValueAtTime(target[side], t + preset.glideSeconds);
    const g = ctx!.createGain();
    g.gain.value = TONE;
    osc.connect(g);
    g.connect(ears, 0, channel);
    return osc;
  });

  if (rain) {
    const noise = ctx.createBufferSource();
    noise.buffer = pinkNoise(ctx);
    noise.loop = true;
    const soft = ctx.createBiquadFilter();
    soft.type = 'lowpass';
    soft.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.value = RAIN;
    noise.connect(soft);
    soft.connect(g);
    g.connect(ears, 0, 0);
    g.connect(ears, 0, 1);
    sources.push(noise);
  }
  for (const s of sources) {
    s.start(t);
    s.stop(end + 0.1);
  }
}

export function stopBinaural(fade = FADE_OUT): void {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + fade);
  for (const s of sources) {
    try {
      s.stop(t + fade + 0.1);
    } catch {
      // Já parado.
    }
  }
  master = null;
  sources = [];
}

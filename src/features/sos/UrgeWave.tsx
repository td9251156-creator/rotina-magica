import { WAVE_PEAK, waveHeight } from '@/domain/urge';

const W = 300;
const H = 70;
const TOP = 10;
const y = (t: number) => H - 6 - waveHeight(t) * (H - 6 - TOP);
const PATH = Array.from({ length: 61 }, (_, i) => `${i ? 'L' : 'M'}${((i / 60) * W).toFixed(1)} ${y(i / 60).toFixed(1)}`).join(' ');

/** A onda da vontade: mostra onde a pessoa está entre subir, o pico e passar. */
export function UrgeWave({ progress }: { progress: number }) {
  const t = Math.min(1, Math.max(0, progress));
  const x = t * W;
  return (
    <svg className="urge-wave" viewBox={`0 -4 ${W} ${H + 18}`} role="img" aria-label={t >= 1 ? 'A onda já passou' : t > WAVE_PEAK ? 'Depois do pico: a onda está descendo' : 'A onda está subindo; logo vem o pico e ela desce'}>
      <defs>
        <linearGradient id="urge-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <clipPath id="urge-past">
          <rect x="0" y="-4" width={x} height={H + 10} />
        </clipPath>
      </defs>
      <path className="urge-wave__line" d={PATH} />
      <g clipPath="url(#urge-past)">
        <path d={`${PATH} L${W} ${H} L0 ${H}Z`} fill="url(#urge-fill)" />
        <path className="urge-wave__line urge-wave__line--past" d={PATH} />
      </g>
      <circle className="urge-wave__dot" cx={x} cy={y(t)} r="6" />
      <text x="0" y={H + 12}>sobe</text>
      <text x={WAVE_PEAK * W} y={H + 12} textAnchor="middle">
        pico
      </text>
      <text x={W} y={H + 12} textAnchor="end">
        passa
      </text>
    </svg>
  );
}

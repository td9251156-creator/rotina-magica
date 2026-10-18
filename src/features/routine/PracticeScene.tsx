import type { PracticeId, PracticePhase } from '@/domain/routine';

/**
 * Cenas das práticas guiadas, desenhadas aqui mesmo (SVG e CSS, sem imagem baixada): um corpo para
 * a luz descer e para apertar e soltar, um quadrado para a respiração em 4 tempos, um orbe que
 * acompanha o ar, o triângulo de fogo e o caminho que se abre na hora de escolher.
 * `progress` vai de 0 a 1 dentro da fase atual.
 */
export interface SceneProps {
  practiceId: PracticeId;
  index: number;
  phase: PracticePhase;
  progress: number;
}

type Part = 'rosto' | 'ombros' | 'bracos' | 'barriga' | 'pernas';

const RELAX_PART: Record<string, Part> = {
  'Pés e pernas': 'pernas',
  Barriga: 'barriga',
  'Mãos e braços': 'bracos',
  Ombros: 'ombros',
  Rosto: 'rosto',
};

/** Pontos do Pilar do Meio no corpo: alto da cabeça, garganta, coração, barriga e pés. */
export const PILLAR_POINTS = [-4, 54, 84, 116, 248] as const;

function Body({ lit, tone, children, under }: { lit?: Part | 'todo'; tone?: 'tense' | 'release'; children?: React.ReactNode; under?: React.ReactNode }) {
  // No corpo todo, barriga e ombros não se destacam: só a silhueta acende, como um contorno de luz.
  const cls = (p: Part) => (lit === p || (lit === 'todo' && p !== 'barriga' && p !== 'ombros') ? `fig__part ${tone ?? 'release'}` : 'fig__part');
  return (
    <svg className="scene fig" viewBox="-10 -20 140 285" aria-hidden="true">
      {under}
      <g className={cls('pernas')}>
        <path className="limb limb--leg" d="M49 136 L46 236 M71 136 L74 236" />
        <ellipse className="solid" cx="42" cy="244" rx="11" ry="5" />
        <ellipse className="solid" cx="78" cy="244" rx="11" ry="5" />
      </g>
      <g className={cls('bracos')}>
        <path className="limb" d="M35 70 Q23 102 21 146 M85 70 Q97 102 99 146" />
        <circle className="solid" cx="21" cy="153" r="7" />
        <circle className="solid" cx="99" cy="153" r="7" />
      </g>
      <path className={`solid fig__torso${lit === 'todo' ? ' fig__part release' : ''}`} d="M34 66 Q60 56 86 66 L82 133 Q60 143 38 133 Z" />
      <g className={cls('barriga')}>
        <ellipse className="solid fig__soft" cx="60" cy="112" rx="17" ry="14" />
      </g>
      <g className={cls('ombros')}>
        <path className="limb limb--thin" d="M31 68 Q60 52 89 68" />
      </g>
      <g className={cls('rosto')}>
        <rect className="solid" x="54" y="44" width="12" height="12" rx="4" />
        <circle className="solid" cx="60" cy="30" r="17" />
      </g>
      {children}
    </svg>
  );
}

function Pillar({ index }: { index: number }) {
  const last = Math.min(index, PILLAR_POINTS.length - 1);
  const whole = index >= PILLAR_POINTS.length;
  return (
    <Body
      under={
        whole && (
          <>
            <defs>
              <radialGradient id="aura">
                <stop offset="0.55" stopColor="#fff" stopOpacity="0.28" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse className="aura" cx="60" cy="120" rx="66" ry="140" fill="url(#aura)" />
          </>
        )
      }
    >
      <line className="beam" x1="60" x2="60" y1={PILLAR_POINTS[0]} y2={PILLAR_POINTS[last]} />
      {PILLAR_POINTS.map((y, i) => (
        <circle key={y} className={`point${i === index ? ' point--on' : i < index ? ' point--done' : ''}`} cx="60" cy={y} r={i === 0 ? 8 : 7} />
      ))}
    </Body>
  );
}

/** Respiração em quadrado: o ponto anda um lado por fase (sobe, atravessa, desce, volta). */
const CORNERS = [
  [30, 170],
  [30, 30],
  [170, 30],
  [170, 170],
] as const;

function BoxBreath({ index, progress }: { index: number; progress: number }) {
  const side = index % 4;
  const [x0, y0] = CORNERS[side];
  const [x1, y1] = CORNERS[(side + 1) % 4];
  const x = x0 + (x1 - x0) * progress;
  const y = y0 + (y1 - y0) * progress;
  const scale = [0.55 + 0.45 * progress, 1, 1 - 0.45 * progress, 0.55][side];
  return (
    <svg className="scene box" viewBox="0 0 200 200" aria-hidden="true">
      <rect className="box__track" x="30" y="30" width="140" height="140" rx="6" />
      <line className="box__side" x1={x0} y1={y0} x2={x} y2={y} />
      <circle className="box__orb" cx="100" cy="100" r="52" style={{ transform: `scale(${scale})` }} />
      <circle className="box__dot" cx={x} cy={y} r="9" />
    </svg>
  );
}

function Orb({ mode, progress = 0 }: { mode: 'cycle' | 'still' | 'in' | 'out'; progress?: number }) {
  const scale = mode === 'in' ? 0.55 + 0.45 * progress : mode === 'out' ? 1 - 0.45 * progress : undefined;
  return (
    <svg className={`scene orb orb--${mode}`} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="orb">
          <stop offset="0" stopColor="#f1e6cf" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#c9a45c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c9a45c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="orb__ring" cx="100" cy="100" r="90" />
      <circle className="orb__core" cx="100" cy="100" r="70" fill="url(#orb)" style={scale ? { transform: `scale(${scale})` } : undefined} />
    </svg>
  );
}

function Triangle({ eyesClosed }: { eyesClosed: boolean }) {
  if (eyesClosed)
    return (
      <svg className="scene eye" viewBox="0 0 200 120" aria-hidden="true">
        <path d="M30 50 Q100 100 170 50" />
        <path d="M60 72 L52 90 M100 82 L100 102 M140 72 L148 90" />
      </svg>
    );
  return (
    <svg className="scene tri" viewBox="0 0 100 90" aria-hidden="true">
      <defs>
        <linearGradient id="fire" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b3201a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ff9a3d" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d="M50 6 94 84H6z" fill="url(#fire)" />
      <path className="tri__inner" d="M50 30 74 72H26z" />
    </svg>
  );
}

/** Observe: corpo, emoção e pensamento acendem um por vez. */
function Observe({ progress }: { progress: number }) {
  const spots: [number, string][] = [
    [112, 'corpo'],
    [84, 'emoção'],
    [30, 'pensamento'],
  ];
  return (
    <Body>
      {spots.map(([y, label], i) =>
        progress >= i / 3 ? (
          <g key={label} className="spot">
            <circle cx="60" cy={y} r="9" />
            <text x="96" y={y + 4}>
              {label}
            </text>
          </g>
        ) : null,
      )}
    </Body>
  );
}

function Fork() {
  return (
    <svg className="scene fork" viewBox="0 0 200 200" aria-hidden="true">
      <path className="fork__path" d="M100 190 L100 110 Q100 80 60 50 L40 20" />
      <path className="fork__path fork__path--lit" d="M100 190 L100 110 Q100 80 140 50 L160 20" />
      <circle className="fork__star" cx="160" cy="20" r="8" />
    </svg>
  );
}

function Burst() {
  return (
    <svg className="scene burst" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="30" />
      <circle cx="100" cy="100" r="30" className="burst__wave" />
    </svg>
  );
}

function Speak() {
  return (
    <svg className="scene speak" viewBox="0 0 200 160" aria-hidden="true">
      <path d="M30 30 h120 a14 14 0 0 1 14 14 v50 a14 14 0 0 1 -14 14 h-80 l-26 22 v-22 h-14 a14 14 0 0 1 -14 -14 v-50 a14 14 0 0 1 14 -14z" />
      <path className="speak__wave" d="M70 70 q10 -14 20 0 t20 0 t20 0" />
    </svg>
  );
}

export function PracticeScene({ practiceId, index, phase, progress }: SceneProps) {
  const label = phase.label;
  if (practiceId === 'pilar') return <Pillar index={index} />;
  if (practiceId === 'respiracao') return <BoxBreath index={index} progress={progress} />;
  if (practiceId === 'triangulo') return <Triangle eyesClosed={label === 'Feche os olhos'} />;
  if (practiceId === 'relaxar') {
    const [verb, part] = label.split(' · ');
    if (!part) return <Body lit="todo" />;
    return <Body lit={RELAX_PART[part]} tone={verb === 'Aperte' ? 'tense' : 'release'} />;
  }
  if (practiceId === 'quebra') {
    if (label === 'Corte') return <Burst />;
    if (label === 'Diga') return <Speak />;
  }
  if (practiceId === 'sober') {
    if (label === 'Pare') return <Orb mode="still" />;
    if (label === 'Observe') return <Observe progress={progress} />;
    if (label === 'Amplie') return <Body lit="todo" under={<line className="ground" x1="-6" x2="126" y1="252" y2="252" />} />;
    if (label === 'Escolha') return <Fork />;
    return <Orb mode="cycle" />;
  }
  const first = label.split(' ')[0];
  return <Orb mode={first === 'Inspire' ? 'in' : first === 'Expire' || first === 'Solte' ? 'out' : 'cycle'} progress={progress} />;
}

/** Contagem da fase dentro de um anel que se esvazia. */
export function PhaseRing({ left, seconds }: { left: number; seconds: number }) {
  const c = 2 * Math.PI * 34;
  return (
    <div className="phase-ring" role="timer" aria-label={`${Math.ceil(left)} segundos`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle className="phase-ring__track" cx="40" cy="40" r="34" />
        <circle className="phase-ring__fill" cx="40" cy="40" r="34" strokeDasharray={c} strokeDashoffset={c * (1 - left / seconds)} />
      </svg>
      <span>{Math.ceil(left)}</span>
    </div>
  );
}

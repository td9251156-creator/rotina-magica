import { useId } from 'react';

/**
 * Ilustrações desenhadas no próprio app (SVG), leves e offline. Cada cena tem cores próprias,
 * pensadas para ficar bonitas no tema noite e no claro. Movimento só de leve, e nenhum com "reduzir movimento".
 */

/** Ids únicos para gradientes: o useId do React traz símbolos que o url(#…) não aceita bem. */
function useUid() {
  return 'il' + useId().replace(/[^a-zA-Z0-9]/g, '');
}

const STARS: [number, number, number][] = [
  [30, 22, 1.4], [72, 48, 1], [118, 18, 1.6], [160, 40, 1], [214, 14, 1.2], [250, 52, 1], [356, 24, 1.4], [384, 60, 1], [96, 78, 0.9], [196, 70, 0.9],
];

export type Period = 'manha' | 'tarde' | 'noite';

/** Céu do momento do dia: nascer do sol, tarde clara ou noite com lua. Fica atrás do título da tela Hoje. */
export function SkyScene({ period }: { period: Period }) {
  const u = useUid();
  const sky = {
    manha: ['#2b2f4a', '#b86f5c', '#f2c58e'],
    tarde: ['#2f5f80', '#6fa3c0', '#cfe1e6'],
    noite: ['#0b0d14', '#151a28', '#232a3d'],
  }[period];
  const hills = { manha: ['#4a3446', '#2a2033'], tarde: ['#3f6352', '#2a4338'], noite: ['#1a1e2b', '#0f1118'] }[period];
  return (
    <svg className="sky" viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.6" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
        <radialGradient id={`${u}g`}>
          <stop offset="0" stopColor="#ffe3a6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe3a6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}t`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b0d14" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#0b0d14" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="170" fill={`url(#${u}s)`} />
      {period === 'noite' && (
        <g className="sky__stars" fill="#f1e6cf">
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} style={{ animationDelay: `${(i % 5) * 0.8}s` }} />
          ))}
        </g>
      )}
      {period === 'manha' && (
        <g>
          <circle className="sky__glow" cx="330" cy="58" r="60" fill={`url(#${u}g)`} />
          <circle cx="330" cy="58" r="20" fill="#ffd590" />
          <path d="M70 52q6-5 12 0q6-5 12 0M104 40q4-3 8 0q4-3 8 0" fill="none" stroke="#3a2c3c" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {period === 'tarde' && (
        <g>
          <circle className="sky__glow" cx="330" cy="36" r="54" fill={`url(#${u}g)`} />
          <circle cx="330" cy="36" r="17" fill="#fff0c2" />
          <g className="sky__cloud" fill="#ffffff" opacity="0.75">
            <ellipse cx="120" cy="50" rx="34" ry="11" />
            <ellipse cx="140" cy="42" rx="20" ry="11" />
            <ellipse cx="236" cy="76" rx="26" ry="8" opacity="0.7" />
          </g>
        </g>
      )}
      {period === 'noite' && (
        <g>
          <circle className="sky__glow" cx="330" cy="36" r="50" fill={`url(#${u}g)`} opacity="0.5" />
          <circle cx="330" cy="36" r="16" fill="#e8d4a3" />
          <circle cx="337" cy="31" r="14" fill={sky[1]} />
        </g>
      )}
      <path d="M0 128c60-22 120-26 190-10s140 14 210-6v58H0z" fill={hills[0]} />
      <path d="M0 150c80-14 150-12 230 0s120 6 170-4v24H0z" fill={hills[1]} />
      {period === 'noite' && (
        <g>
          <path d="M336 146v-14l12-10 12 10v14z" fill="#0b0d12" />
          <rect className="sky__window" x="344" y="132" width="8" height="7" rx="1" fill="#e9b85e" />
        </g>
      )}
      <rect width="400" height="170" fill={`url(#${u}t)`} />
    </svg>
  );
}

/** Desenho de cada jogo, no topo do cartão da lista de jogos. */
export function GameArt({ id }: { id: string }) {
  const u = useUid();
  return (
    <svg className="game-art" viewBox="0 0 160 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2230" />
          <stop offset="1" stopColor="#12141c" />
        </linearGradient>
      </defs>
      <rect width="160" height="64" fill={`url(#${u}b)`} />
      {id === 'blocos' && (
        <g stroke="#0e1017" strokeWidth="1.2">
          {[
            [40, 52, '#e07a5f'], [50, 52, '#e07a5f'], [60, 52, '#7fb7d9'], [70, 52, '#7fb7d9'], [80, 52, '#c9a45c'], [100, 52, '#8fc79a'], [110, 52, '#8fc79a'], [120, 52, '#a98bd6'],
            [40, 42, '#c9a45c'], [60, 42, '#7fb7d9'], [100, 42, '#8fc79a'], [110, 42, '#a98bd6'], [120, 42, '#a98bd6'],
          ].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width="10" height="10" rx="2" fill={c as string} />
          ))}
          <g className="game-art__fall">
            {[[80, 12], [90, 12], [100, 12], [90, 2]].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="10" height="10" rx="2" fill="#f1e6cf" />
            ))}
          </g>
        </g>
      )}
      {id === 'pares' && (
        <g>
          {[[48, 18, 0], [72, 18, 0], [96, 18, 0], [60, 10, 1], [84, 10, 1]].map(([x, y, z], i) => (
            <g key={i}>
              <rect x={x + 3} y={y + 4} width="22" height="30" rx="4" fill="#8f7d55" />
              <rect x={x} y={y} width="22" height="30" rx="4" fill={z ? '#f8eccc' : '#e8dab4'} stroke="#b9a77f" />
            </g>
          ))}
          <circle cx="71" cy="25" r="5" fill="none" stroke="#c0623f" strokeWidth="2" />
          <circle cx="95" cy="25" r="5" fill="none" stroke="#c0623f" strokeWidth="2" />
          <path d="M107 33l4-8 4 8z" fill="#4f8a6b" />
        </g>
      )}
      {id === 'arcanos' && (
        <g>
          <rect x="46" y="12" width="30" height="42" rx="4" fill="#1b1e2c" stroke="#c9a45c" transform="rotate(-12 61 33)" />
          <rect x="84" y="12" width="30" height="42" rx="4" fill="#1b1e2c" stroke="#c9a45c" transform="rotate(12 99 33)" />
          <rect x="65" y="8" width="30" height="44" rx="4" fill="#f3e7c9" stroke="#b9a77f" />
          <path d="M80 18l3 8 8 .5-6 5 2 8-7-4.5-7 4.5 2-8-6-5 8-.5z" fill="#c9a45c" />
        </g>
      )}
      {id === 'onda' && (
        <g fill="none" strokeLinecap="round">
          <circle className="game-art__breath" cx="80" cy="26" r="12" fill="#c9a45c" opacity="0.85" />
          <path d="M0 46q20-8 40 0t40 0 40 0 40 0" stroke="#6fb7e8" strokeWidth="3" />
          <path d="M0 56q20-6 40 0t40 0 40 0 40 0" stroke="#2f5f7a" strokeWidth="3" />
        </g>
      )}
      {id === 'noite' && (
        <g>
          <circle cx="124" cy="18" r="8" fill="#e8d4a3" />
          <circle cx="128" cy="15" r="7" fill="#1b1f2c" />
          <path d="M10 64V40h12v-8h10v14h10V34h14v30zM104 64V44h10v-10h14v12h10v18z" fill="#0b0d12" />
          {[[14, 46], [46, 42], [108, 50], [120, 40]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="4" height="4" fill="#e9b85e" opacity="0.85" />
          ))}
          <path d="M80 64v-12M80 52l-12-12M80 52l12-12" stroke="#c9a45c" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="92" cy="40" r="3" fill="#f1e6cf" />
        </g>
      )}
    </svg>
  );
}

/** Desenho de cada faixa de "Sons para relaxar": sol na água calma, lua sobre o mar, lua com estrelas. */
export function SoundArt({ id }: { id: string }) {
  const u = useUid();
  const night = id !== 'calma';
  return (
    <svg className="sound-art" viewBox="0 0 120 56" aria-hidden="true">
      <defs>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? '#121522' : '#2b3550'} />
          <stop offset="1" stopColor={night ? '#1f2638' : '#b9806a'} />
        </linearGradient>
      </defs>
      <rect width="120" height="56" rx="12" fill={`url(#${u}b)`} />
      {id === 'calma' && <circle cx="60" cy="38" r="12" fill="#ffd590" />}
      {id === 'fundo' && (
        <g>
          <circle cx="60" cy="24" r="9" fill="#e8d4a3" />
          <circle cx="64" cy="21" r="8" fill="#151a28" />
        </g>
      )}
      {id === 'sono' && (
        <g fill="#f1e6cf">
          <circle cx="58" cy="22" r="9" fill="#e8d4a3" />
          <circle cx="62" cy="19" r="8" fill="#141826" />
          <circle cx="24" cy="14" r="1.2" />
          <circle cx="92" cy="12" r="1.4" />
          <circle cx="100" cy="30" r="1" />
          <circle cx="34" cy="30" r="1" />
        </g>
      )}
      {id !== 'sono' && (
        <g fill="none" stroke={night ? '#6fa3c0' : '#f6dcb4'} strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
          <path className="sound-art__wave" d="M8 44q8-3 16 0t16 0 16 0 16 0 16 0 16 0 16 0" />
          <path d="M20 50q8-2 16 0t16 0 16 0 16 0 16 0" opacity="0.6" />
        </g>
      )}
      {id === 'sono' && <path d="M0 48c30-6 60-6 120 0v8H0z" fill="#0f1220" />}
    </svg>
  );
}

/** Um broto saindo da terra com o sol nascendo atrás: recomeçar, sem culpa. */
export function SproutArt() {
  const u = useUid();
  return (
    <svg className="illus" viewBox="0 0 400 150" role="img" aria-label="Um broto nascendo com o sol atrás">
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2230" />
          <stop offset="1" stopColor="#5a4150" />
        </linearGradient>
      </defs>
      <rect width="400" height="150" rx="22" fill={`url(#${u}s)`} />
      <circle className="sky__glow" cx="200" cy="118" r="54" fill="#f2c58e" opacity="0.25" />
      <circle cx="200" cy="118" r="30" fill="#f2c58e" opacity="0.9" />
      <path d="M0 118h400v32H0z" fill="#2a2033" />
      <path d="M0 118c80-6 140 4 200 0s130-6 200 0" fill="none" stroke="#3a2c3c" strokeWidth="2" />
      <g className="sprout">
        <path d="M200 118c0-16 0-26 2-40" fill="none" stroke="#8fc79a" strokeWidth="4" strokeLinecap="round" />
        <path d="M201 94c-18 0-28-10-30-22 16-2 28 6 30 22z" fill="#8fc79a" />
        <path d="M202 84c4-16 16-24 30-22-2 14-14 22-30 22z" fill="#a9d8a8" />
      </g>
    </svg>
  );
}

/** Mar que acalmou, com o sol nascendo: a onda passou. */
export function CalmSeaArt() {
  const u = useUid();
  return (
    <svg className="illus" viewBox="0 0 400 150" role="img" aria-label="Mar calmo com o sol nascendo">
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2f4a" />
          <stop offset="1" stopColor="#e7a77c" />
        </linearGradient>
      </defs>
      <rect width="400" height="150" rx="22" fill={`url(#${u}s)`} />
      <circle className="sky__glow" cx="200" cy="96" r="60" fill="#ffd590" opacity="0.3" />
      <circle cx="200" cy="96" r="28" fill="#ffd590" />
      <path d="M0 96h400v54H0z" fill="#33405a" />
      <g fill="none" stroke="#f6dcb4" strokeLinecap="round" opacity="0.7">
        <path d="M170 106h60M150 118h100M120 132h160" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** Um caminho que sobe entre morros até a luz: cada exercício é um passo. Topo de Terapias e vivências. */
export function PathArt() {
  const u = useUid();
  return (
    <svg className="illus" viewBox="0 0 400 130" role="img" aria-label="Um caminho entre morros indo até a luz">
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151a28" />
          <stop offset="1" stopColor="#3a3350" />
        </linearGradient>
        <linearGradient id={`${u}p`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c9a45c" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f1e6cf" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="400" height="130" rx="22" fill={`url(#${u}s)`} />
      <circle className="sky__glow" cx="250" cy="58" r="40" fill="#f2c58e" opacity="0.25" />
      <circle cx="250" cy="58" r="12" fill="#f2c58e" />
      <g fill="#f1e6cf">
        <circle cx="40" cy="22" r="1.2" />
        <circle cx="110" cy="36" r="1" />
        <circle cx="330" cy="20" r="1.4" />
        <circle cx="372" cy="46" r="1" />
      </g>
      <path d="M0 84c70-20 130-24 200-8s130 14 200-4v58H0z" fill="#23283a" />
      <path d="M0 108c90-14 160-10 240 2s110 6 160-2v22H0z" fill="#161922" />
      <path d="M150 130c20-18 60-20 70-34s20-18 30-22" fill="none" stroke={`url(#${u}p)`} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

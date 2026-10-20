import { useId } from 'react';
import type { GameId } from '@/domain/progression';

/**
 * Ilustrações locais (SVG e capas WebP), leves e offline. Cada cena tem cores próprias,
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

/** Capas locais da mesma família visual; os nomes dos jogos ficam no texto do cartão. */
export function GameArt({ id }: { id: GameId }) {
  return (
    <img
      className="game-art"
      src={`${import.meta.env.BASE_URL}illustrations/games/${id}.webp`}
      width="480"
      height="320"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
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

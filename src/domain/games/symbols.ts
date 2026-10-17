/**
 * Símbolos do ocultismo nos jogos: planetas, signos, a Árvore da Vida e os Arcanos Maiores, com as
 * correspondências da Golden Dawn (base também do tarô de Thoth). Ligados por padrão para quem faz a
 * rotina com ritual; quem prefere sem, joga com os símbolos de sempre.
 */
import type { RoutineStyle } from '../routine';

/** Ligados se a pessoa escolheu; senão, seguem o estilo da rotina. */
export function symbolsOn(choice: boolean | null, style: RoutineStyle | null): boolean {
  return choice ?? style === 'magica';
}

/** Elemento (sem desenho, vira um triângulo simples, porque o celular nem sempre tem a letra). */
export type Element = 'fogo' | 'agua' | 'ar' | 'terra';

/** Planetas, signos e elementos: cada um tem um id; o desenho dele, se existir, fica em `features/games/art.ts`. */
export const SYMBOL_IDS = [
  'sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno',
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem', 'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes',
  'fogo', 'agua', 'ar', 'terra',
] as const;
export type SymbolId = (typeof SYMBOL_IDS)[number];

export interface Sign {
  id: SymbolId;
  /** Símbolo em texto, enquanto não há desenho. */
  glyph: string;
  name: string;
  color: string;
}

/** Pede a versão em traço do símbolo, não o emoji. */
const T = '\uFE0E';
const PLANET = '#d8b46a';
/** Cores dos elementos na Golden Dawn: fogo vermelho, água azul, ar amarelo, terra verde. */
export const ELEMENT_COLOR: Record<Element, string> = {
  fogo: '#e8775b',
  agua: '#5fa8e8',
  ar: '#e8c95b',
  terra: '#6fc79a',
};

/** Os 7 planetas da tradição e os 12 signos, cada signo na cor do seu elemento. */
export const OCCULT_SIGNS: Sign[] = [
  { id: 'sol', glyph: '☉' + T, name: 'Sol', color: PLANET },
  { id: 'lua', glyph: '☽' + T, name: 'Lua', color: '#cfd8ea' },
  { id: 'mercurio', glyph: '☿' + T, name: 'Mercúrio', color: PLANET },
  { id: 'venus', glyph: '♀' + T, name: 'Vênus', color: PLANET },
  { id: 'marte', glyph: '♂' + T, name: 'Marte', color: PLANET },
  { id: 'jupiter', glyph: '♃' + T, name: 'Júpiter', color: PLANET },
  { id: 'saturno', glyph: '♄' + T, name: 'Saturno', color: PLANET },
  { id: 'aries', glyph: '♈' + T, name: 'Áries', color: ELEMENT_COLOR.fogo },
  { id: 'touro', glyph: '♉' + T, name: 'Touro', color: ELEMENT_COLOR.terra },
  { id: 'gemeos', glyph: '♊' + T, name: 'Gêmeos', color: ELEMENT_COLOR.ar },
  { id: 'cancer', glyph: '♋' + T, name: 'Câncer', color: ELEMENT_COLOR.agua },
  { id: 'leao', glyph: '♌' + T, name: 'Leão', color: ELEMENT_COLOR.fogo },
  { id: 'virgem', glyph: '♍' + T, name: 'Virgem', color: ELEMENT_COLOR.terra },
  { id: 'libra', glyph: '♎' + T, name: 'Libra', color: ELEMENT_COLOR.ar },
  {
    id: 'escorpiao',
    glyph: '♏' + T,
    name: 'Escorpião',
    color: ELEMENT_COLOR.agua,
  },
  {
    id: 'sagitario',
    glyph: '♐' + T,
    name: 'Sagitário',
    color: ELEMENT_COLOR.fogo,
  },
  {
    id: 'capricornio',
    glyph: '♑' + T,
    name: 'Capricórnio',
    color: ELEMENT_COLOR.terra,
  },
  { id: 'aquario', glyph: '♒' + T, name: 'Aquário', color: ELEMENT_COLOR.ar },
  { id: 'peixes', glyph: '♓' + T, name: 'Peixes', color: ELEMENT_COLOR.agua },
];

/** As 10 esferas da Árvore da Vida, de baixo (Malkuth) para cima (Kether), com o sentido em português. */
export const SEPHIROTH = [
  { name: 'Malkuth', meaning: 'o Reino' },
  { name: 'Yesod', meaning: 'o Fundamento' },
  { name: 'Hod', meaning: 'o Esplendor' },
  { name: 'Netzach', meaning: 'a Vitória' },
  { name: 'Tiphareth', meaning: 'a Beleza' },
  { name: 'Geburah', meaning: 'a Força' },
  { name: 'Chesed', meaning: 'a Misericórdia' },
  { name: 'Binah', meaning: 'o Entendimento' },
  { name: 'Chokmah', meaning: 'a Sabedoria' },
  { name: 'Kether', meaning: 'a Coroa' },
] as const;

/** Esfera de um nível do Blocos: sobe a Árvore a cada nível e fica em Kether depois do 10. */
export function sephirah(level: number) {
  return SEPHIROTH[Math.min(SEPHIROTH.length, Math.max(1, level)) - 1];
}

export interface Arcanum {
  n: number;
  name: string;
  /** Nome no tarô de Thoth, quando muda e o número é o mesmo. */
  thoth?: string;
  /** Planeta, signo ou elemento atribuído pela Golden Dawn. */
  symbol: SymbolId;
  /** Uma ideia para a vida, em palavras simples. Não é adivinhação. */
  lesson: string;
}

/** Os 22 Arcanos Maiores. */
export const ARCANA: Arcanum[] = [
  {
    n: 0,
    name: 'O Louco',
    symbol: 'ar',
    lesson: 'Começar de novo, sem carregar o peso de ontem.',
  },
  {
    n: 1,
    name: 'O Mago',
    symbol: 'mercurio',
    lesson: 'Usar o que você já tem nas mãos.',
  },
  {
    n: 2,
    name: 'A Sacerdotisa',
    symbol: 'lua',
    lesson: 'Fazer silêncio e escutar a si mesmo.',
  },
  {
    n: 3,
    name: 'A Imperatriz',
    symbol: 'venus',
    lesson: 'Cuidar do corpo: comida, sono, natureza.',
  },
  {
    n: 4,
    name: 'O Imperador',
    symbol: 'aries',
    lesson: 'Rotina e limites claros dão segurança.',
  },
  {
    n: 5,
    name: 'O Hierofante',
    symbol: 'touro',
    lesson: 'Aprender com quem já passou por isso.',
  },
  {
    n: 6,
    name: 'Os Enamorados',
    symbol: 'gemeos',
    lesson: 'Escolher pelo que você valoriza.',
  },
  {
    n: 7,
    name: 'O Carro',
    symbol: 'cancer',
    lesson: 'Seguir em frente com direção.',
  },
  {
    n: 8,
    name: 'A Força',
    symbol: 'leao',
    lesson: 'Domar o impulso com gentileza, não com briga.',
  },
  {
    n: 9,
    name: 'O Eremita',
    symbol: 'virgem',
    lesson: 'Um tempo a sós para clarear, sem se isolar.',
  },
  {
    n: 10,
    name: 'A Roda da Fortuna',
    symbol: 'jupiter',
    lesson: 'Tudo passa, inclusive a vontade.',
  },
  {
    n: 11,
    name: 'A Justiça',
    symbol: 'libra',
    lesson: 'Olhar os fatos com honestidade, sem se culpar.',
  },
  {
    n: 12,
    name: 'O Enforcado',
    symbol: 'agua',
    lesson: 'Ver a situação por outro ângulo.',
  },
  {
    n: 13,
    name: 'A Morte',
    symbol: 'escorpiao',
    lesson: 'Deixar um hábito acabar para algo novo nascer.',
  },
  {
    n: 14,
    name: 'A Temperança',
    thoth: 'Arte',
    symbol: 'sagitario',
    lesson: 'Equilíbrio, um passo de cada vez.',
  },
  {
    n: 15,
    name: 'O Diabo',
    symbol: 'capricornio',
    lesson: 'Enxergar a corrente é o primeiro passo para soltá-la.',
  },
  {
    n: 16,
    name: 'A Torre',
    symbol: 'marte',
    lesson: 'Uma queda pode abrir espaço para recomeçar.',
  },
  {
    n: 17,
    name: 'A Estrela',
    symbol: 'aquario',
    lesson: 'Esperança depois da tempestade.',
  },
  {
    n: 18,
    name: 'A Lua',
    symbol: 'peixes',
    lesson: 'A vontade engana: nem tudo é o que parece.',
  },
  {
    n: 19,
    name: 'O Sol',
    symbol: 'sol',
    lesson: 'Clareza e alegrias simples.',
  },
  {
    n: 20,
    name: 'O Julgamento',
    thoth: 'Eon',
    symbol: 'fogo',
    lesson: 'Despertar e fazer as pazes consigo.',
  },
  {
    n: 21,
    name: 'O Mundo',
    thoth: 'Universo',
    symbol: 'saturno',
    lesson: 'Fechar um ciclo e celebrar o caminho.',
  },
];

const ROMAN: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function roman(n: number): string {
  if (n === 0) return '0';
  let out = '';
  let rest = n;
  for (const [v, s] of ROMAN)
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  return out;
}

/** Texto de cada símbolo, usado enquanto não há desenho (elementos não têm: viram triângulo). */
export function symbolText(id: SymbolId): string | null {
  return OCCULT_SIGNS.find((x) => x.id === id)?.glyph ?? null;
}

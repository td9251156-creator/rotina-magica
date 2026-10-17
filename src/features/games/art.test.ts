import { SYMBOL_IDS } from '@/domain/games/symbols';
import { SYMBOL_ART } from './art';

const TAGS = new Set(['path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect', 'g']);
const ATTRS = new Set([
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'points',
  'transform',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'fill-rule',
]);
const COLORS = new Set(['none', 'currentColor']);

/** Confere um desenho colado: só formas simples, na cor do texto, e nada que rode código. */
export function checkArt(markup: string): string[] {
  const problems: string[] = [];
  const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return ['SVG mal formado'];
  doc.documentElement.querySelectorAll('*').forEach((el) => {
    if (!TAGS.has(el.tagName)) problems.push(`tag <${el.tagName}>`);
    for (const a of Array.from(el.attributes)) {
      if (!ATTRS.has(a.name)) problems.push(`atributo ${a.name}`);
      if ((a.name === 'fill' || a.name === 'stroke') && !COLORS.has(a.value)) problems.push(`cor ${a.value}`);
    }
  });
  return problems;
}

describe('desenhos dos símbolos', () => {
  it('cada desenho é de um símbolo que existe e só tem formas seguras', () => {
    Object.entries(SYMBOL_ART).forEach(([id, markup]) => {
      expect([...SYMBOL_IDS, 'verso']).toContain(id);
      expect({ id, problems: checkArt(markup ?? '') }).toEqual({
        id,
        problems: [],
      });
    });
  });

  it('a conferência recusa script, cor fixa e eventos', () => {
    expect(checkArt('<path d="M0 0" stroke="currentColor"/>')).toEqual([]);
    expect(checkArt('<script>alert(1)</script>')).toContain('tag <script>');
    expect(checkArt('<path d="M0 0" onclick="x()"/>')).toContain('atributo onclick');
    expect(checkArt('<path d="M0 0" fill="#f00"/>')).toContain('cor #f00');
    expect(checkArt('<path d="M0 0"')).toEqual(['SVG mal formado']);
  });
});

/** Conferência dos desenhos colados de outra IA: usada pelos testes de `app-icons.ts` e `games/art.ts`. */
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

/** Problemas de um desenho: só formas simples, na cor do texto, e nada que rode código. */
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

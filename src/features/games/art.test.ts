import { SYMBOL_IDS } from '@/domain/games/symbols';
import { checkArt } from '@/ui/svg-check';
import { SYMBOL_ART } from './art';

describe('desenhos dos símbolos', () => {
  it('todo símbolo tem desenho', () => {
    expect(Object.keys(SYMBOL_ART).sort()).toEqual([...SYMBOL_IDS, 'verso'].sort());
  });

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

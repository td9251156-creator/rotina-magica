import { ELEMENT_COLOR, symbolText, type Element, type SymbolId } from '@/domain/games/symbols';
import { SYMBOL_ART, type ArtId } from './art';

const ELEMENTS: string[] = ['fogo', 'agua', 'ar', 'terra'];

/** Desenho de `art.ts` num quadrado 24×24, na cor do texto em volta. */
export function Art({ id, className = 'glyph glyph--art' }: { id: ArtId; className?: string }) {
  const art = SYMBOL_ART[id];
  if (!art) return null;
  // O conteúdo vem do próprio repositório e passa pelo teste de formato (só formas, sem script).
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: art }} />;
}

/** Símbolo de planeta, signo ou elemento: o desenho, se houver; senão a letra ou um triângulo simples. */
export function Glyph({ id }: { id: SymbolId }) {
  if (SYMBOL_ART[id]) return <Art id={id} />;
  const text = symbolText(id);
  if (text) return <span className="glyph">{text}</span>;
  if (!ELEMENTS.includes(id)) return null;
  const el = id as Element;
  const up = el === 'fogo' || el === 'ar';
  const bar = el === 'ar' || el === 'terra';
  return (
    <svg className="glyph glyph--art" viewBox="0 0 24 24" aria-hidden="true" style={{ color: ELEMENT_COLOR[el] }}>
      <path d={up ? 'M12 3 L22 20 H2 Z' : 'M12 21 L22 4 H2 Z'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {bar && <path d={up ? 'M6.5 13.5 H17.5' : 'M6.5 10.5 H17.5'} stroke="currentColor" strokeWidth="2" />}
    </svg>
  );
}

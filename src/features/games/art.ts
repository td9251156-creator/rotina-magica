/**
 * Desenhos dos símbolos dos jogos (planetas, signos, elementos e o verso das cartas do Arcanos).
 *
 * Cada valor é o miolo de um <svg viewBox="0 0 24 24">: só formas (path, circle, line...), em
 * traço `currentColor`, sem cor fixa, texto, imagem ou script. Quem falta aparece como letra
 * simples. O teste `art.test.ts` confere o formato antes de entrar no app.
 *
 * Desenhados por outra IA a partir de `docs/prompt-simbolos.md`; para trocar, cole aqui o novo objeto.
 */
import type { SymbolId } from '@/domain/games/symbols';

export type ArtId = SymbolId | 'verso';

export const SYMBOL_ART: Partial<Record<ArtId, string>> = {
  sol: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  lua: '<path d="M14,4 A8,8 0 1,0 14,20 A6,6 0 1,1 14,4 Z"/>',
  mercurio: '<circle cx="12" cy="10.5" r="3.5"/><path d="M9,6 A3.5,3.5 0 0,0 15,6 M12,14 V21 M9,17.5 H15"/>',
  venus: '<circle cx="12" cy="8.5" r="4.5"/><path d="M12,13 V21 M9,17 H15"/>',
  marte: '<circle cx="10" cy="14" r="4.5"/><path d="M13.18,10.82 L19,5 M15,5 H19 V9"/>',
  jupiter: '<path d="M12,5 A4.5,4.5 0 0,0 12,14 H19 M15,8 V20"/>',
  saturno: '<path d="M9,4 V15 M6,7 H12 M9,13 A4,4 0 0,1 16,16 V18 A3,3 0 0,1 11,19"/>',
  aries: '<path d="M12,20 V9 C12,3 5,4 5,8 C5,11 8,11 8,9 M12,9 C12,3 19,4 19,8 C19,11 16,11 16,9"/>',
  touro: '<circle cx="12" cy="14" r="5"/><path d="M7,10 C7,5 17,5 17,10"/>',
  gemeos: '<path d="M8,5 V19 M16,5 V19 M5,5 C9,3 15,3 19,5 M5,19 C9,21 15,21 19,19"/>',
  cancer: '<circle cx="16" cy="8" r="3"/><path d="M16,5 C10,5 6,7 5,11"/><circle cx="8" cy="16" r="3"/><path d="M8,19 C14,19 18,17 19,13"/>',
  leao: '<circle cx="7" cy="15" r="3"/><path d="M6,12 A3,3 0 1,0 6,18 A3,3 0 0,0 8.5,13.5 C11,8 17,6 17,12 C17,17 7,16 7,20 C7,22 13,22 16,19"/>',
  virgem: '<path d="M4,7 V18 M4,10 C4,7 10,7 10,11 V18 M10,10 C10,7 16,7 16,11 V15 C16,19 12,21 9,20 M16,13 C19,12 21,15 19,18 C18,20 15,22 13,20"/>',
  libra: '<path d="M5,17 H19 M4,13 H9 A3.5,3.5 0 1,1 15,13 H20"/>',
  escorpiao: '<path d="M4,7 V18 M4,10 C4,7 10,7 10,11 V18 M10,10 C10,7 16,7 16,11 V16 C16,19 19,19 20,16 L21,14 M17,14 H21 V18"/>',
  sagitario: '<path d="M5,19 L19,5 M12,5 H19 V12 M9,9 L15,15"/>',
  capricornio: '<path d="M5,7 Q8,16 9,16 Q11,16 13,8 C15,3 20,3 20,8 C20,13 13,16 13,20 C13,22 17,22 19,20"/>',
  aquario: '<path d="M4,10 L8,6 L12,10 L16,6 L20,10 M4,18 L8,14 L12,18 L16,14 L20,18"/>',
  peixes: '<path d="M7,4 C4,10 4,14 7,20 M17,4 C20,10 20,14 17,20 M5,12 H19"/>',
  fogo: '<polygon points="12,4 20,18 4,18"/>',
  agua: '<polygon points="12,20 4,6 20,6"/>',
  ar: '<polygon points="12,4 20,18 4,18"/><line x1="8" y1="11" x2="16" y2="11"/>',
  terra: '<polygon points="12,20 4,6 20,6"/><line x1="8" y1="13" x2="16" y2="13"/>',
  verso: '<circle cx="12" cy="12" r="10"/><polygon points="12,3 13.5,8.5 18.5,5.5 15.5,10.5 21,12 15.5,13.5 18.5,18.5 13.5,15.5 12,21 10.5,15.5 5.5,18.5 8.5,13.5 3,12 8.5,10.5 5.5,5.5 10.5,8.5"/><polygon points="12,10 14,12 12,14 10,12"/>',
};

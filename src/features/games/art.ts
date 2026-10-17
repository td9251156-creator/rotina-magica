/**
 * Desenhos dos símbolos dos jogos (planetas, signos, elementos e o verso das cartas do Arcanos).
 *
 * Cada valor é o miolo de um <svg viewBox="0 0 24 24">: só formas (path, circle, line...), em
 * traço `currentColor`, sem cor fixa, texto, imagem ou script. Quem falta aparece como letra
 * simples. O teste `art.test.ts` confere o formato antes de entrar no app.
 *
 * Para trocar: cole aqui o objeto que a outra IA gerar (ver `docs/prompt-simbolos.md`).
 */
import type { SymbolId } from '@/domain/games/symbols';

export type ArtId = SymbolId | 'verso';

export const SYMBOL_ART: Partial<Record<ArtId, string>> = {};

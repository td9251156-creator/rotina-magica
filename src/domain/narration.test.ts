import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cueFile, cueText, extraNarration, trainingFile } from './narration';
import { TECHNIQUES } from './training';

describe('narração extra', () => {
  it('cada passo das vivências e cada aviso curto tem um arquivo, sem repetir', () => {
    const files = extraNarration();
    expect(new Set(files.map((f) => f.path)).size).toBe(files.length);
    for (const t of TECHNIQUES) t.steps.forEach((s, i) => expect(files).toContainEqual({ path: trainingFile(t.id, i), text: s.text }));
    expect(files.map((f) => f.path)).toContain('cues/inspire.mp3');
  });

  it('aviso de fase curta diz só o título, para não atropelar a próxima', () => {
    expect(cueText({ label: 'Corte', seconds: 4, hint: 'Estalo leve.' })).toBe('Corte');
    expect(cueText({ label: 'Diga', seconds: 6, hint: 'Eu escolho.' })).toBe('Diga. Eu escolho.');
    expect(cueFile({ label: 'Diga', seconds: 6, hint: '"Quem manda sou eu."' })).toBe('cues/diga-quem-manda-sou-eu.mp3');
  });

  it('os áudios gerados falam o texto que está no app', () => {
    // Mudou um passo ou um aviso? Gere a narração de novo (workflow "Narração").
    const manifest = 'public/audio/textos.json';
    if (!existsSync(manifest)) return;
    expect(JSON.parse(readFileSync(manifest, 'utf8'))).toEqual(extraNarration());
  });
});

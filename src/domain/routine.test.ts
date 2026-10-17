import { readFileSync, readdirSync } from 'node:fs';
import { ALL_STEPS, ESSENTIAL_STEP_IDS, PRACTICES, essentialRoutine, findStep, isHardDay, phaseSpeech, voiceScript, intoneScript, phaseScript, spokenMs, LONG_PAUSE_MS, MAX_GAP_MS, INHALE_MS, lastWeekCount, periodFor, phaseAt, practiceSeconds, routineDays, routineFor } from './routine';

describe('rotina', () => {
  it('tem ids únicos e acha passos', () => {
    expect(new Set(ALL_STEPS.map((s) => s.id)).size).toBe(ALL_STEPS.length);
    expect(findStep('n_diario')?.link).toBe('diario');
  });

  it('período do dia segue a hora e a saída do trabalho', () => {
    expect(periodFor(new Date(2026, 9, 16, 7), '18:00')).toBe('manha');
    expect(periodFor(new Date(2026, 9, 16, 15), '18:00')).toBe('tarde');
    expect(periodFor(new Date(2026, 9, 16, 18, 30), '18:00')).toBe('noite');
    expect(periodFor(new Date(2026, 9, 16, 2), '18:00')).toBe('noite');
  });

  it('dias com rotina só crescem', () => {
    expect(routineDays(['2026-10-01', '2026-10-01', '2026-10-10'])).toBe(2);
    expect(lastWeekCount(['2026-10-01', '2026-10-12', '2026-10-16'], '2026-10-16')).toBe(2);
  });

  it('prática guiada avança pelas fases', () => {
    const p = PRACTICES.respiracao;
    expect(practiceSeconds(p)).toBe(240);
    expect(phaseAt(p, 0)?.phase.label).toBe('Inspire');
    expect(phaseAt(p, 5)).toMatchObject({ phase: { label: 'Segure' }, left: 3 });
    expect(phaseAt(p, 240)).toBeNull();
  });

  it('a rotina simples troca o ritual sem mudar os ids', () => {
    const magica = routineFor('magica').flatMap((p) => p.steps);
    const simples = routineFor('simples').flatMap((p) => p.steps);
    expect(simples.map((s) => s.id)).toEqual(magica.map((s) => s.id));
    expect(findStep('n_pilar', 'simples')).toMatchObject({ title: 'Relaxar o corpo', practice: 'relaxar' });
    expect(simples.some((s) => /pentagrama|saudação ao Sol/i.test(s.how.join(' ')))).toBe(false);
    expect(practiceSeconds(PRACTICES.relaxar)).toBe(130);
  });

  it('dia difícil: só o básico, em todos os períodos, e só no dia marcado', () => {
    const essentials = essentialRoutine(routineFor('simples'));
    expect(essentials.flatMap((p) => p.steps.map((s) => s.id))).toEqual([...ESSENTIAL_STEP_IDS]);
    expect(essentials.every((p) => p.steps.length > 0)).toBe(true);
    expect(essentials.flatMap((p) => p.steps).reduce((m, s) => m + s.minutes, 0)).toBeLessThanOrEqual(10);
    expect(isHardDay('2026-10-17', '2026-10-17')).toBe(true);
    expect(isHardDay('2026-10-16', '2026-10-17')).toBe(false);
    expect(isHardDay(null, '2026-10-17')).toBe(false);
  });

  it('a voz diz a instrução e a dica', () => {
    expect(phaseSpeech({ label: 'Puxe o ar', seconds: 4 })).toBe('Puxe o ar');
    expect(phaseSpeech({ label: 'Solte', seconds: 4, hint: 'devagar' })).toBe('Solte. devagar');
  });

  it('a voz fala em frases curtas, com pausa curta na vírgula e longa no ponto', () => {
    expect(voiceScript('Puxe o ar, devagar. Segure')).toEqual([
      { text: 'Puxe o ar', pauseMs: 900 },
      { text: 'devagar', pauseMs: 2200 },
      { text: 'Segure', pauseMs: 900 },
    ]);
    expect(voiceScript('  ')).toEqual([]);
    expect(voiceScript('Aperte · Rosto').map((l) => l.text)).toEqual(['Aperte', 'Rosto']);
  });

  it('nome vibrado: sílaba por sílaba, repetido, com tempo para puxar o ar', () => {
    const lines = intoneScript('Xa-dái El Rái', 2);
    expect(lines.map((l) => l.text)).toEqual(['Xa', 'dái', 'El', 'Rái', 'Xa', 'dái', 'El', 'Rái']);
    expect(lines.every((l) => l.intone)).toBe(true);
    expect(lines[3].pauseMs).toBe(INHALE_MS);
  });

  it('fase sem roteiro fala o título e a dica', () => {
    const phase = { label: 'Inspire', seconds: 4 };
    expect(phaseScript(phase)).toEqual(voiceScript('Inspire'));
  });

  it('as falas guiadas cabem em cada fase, com silêncios no ritmo dos áudios de referência', () => {
    for (const p of Object.values(PRACTICES))
      for (const phase of p.phases) {
        if (!phase.guide) continue;
        const script = phaseScript(phase);
        expect(spokenMs(script), `${p.id} · ${phase.label}`).toBeLessThanOrEqual(phase.seconds * 950);
        const gap = script[script.length - 1].pauseMs;
        expect(gap).toBeGreaterThanOrEqual(LONG_PAUSE_MS);
        expect(gap).toBeLessThanOrEqual(MAX_GAP_MS);
      }
  });

  it('as práticas longas têm voz guiando do começo ao fim e terminam trazendo a pessoa de volta', () => {
    for (const id of ['triangulo', 'pilar', 'relaxar', 'sober'] as const) {
      const phases = PRACTICES[id].phases;
      expect(phases.every((f) => f.guide?.length)).toBe(true);
    }
    const last = (id: 'triangulo' | 'pilar') => PRACTICES[id].phases.at(-1)?.guide?.at(-1);
    expect(last('triangulo')).toMatch(/abra os olhos/);
    expect(last('pilar')).toMatch(/abra os olhos/);
    expect(PRACTICES.pilar.phases.filter((f) => f.guide?.some((g) => typeof g !== 'string'))).toHaveLength(5);
  });

  it('o roteiro de gravação e os áudios narrados seguem o texto do app', () => {
    // Mudou uma fala? Rode o mesmo formato abaixo em docs/roteiro-narracao.md e gere os áudios de novo
    // (scripts/gerar-narracao.py), senão o áudio gravado diz uma coisa e a tela outra.
    const expected: string[] = [];
    const files: string[] = [];
    for (const p of Object.values(PRACTICES)) {
      if (!p.phases.some((f) => f.guide)) continue;
      expected.push(`## ${p.title} (\`${p.id}\`)`, '');
      p.phases.forEach((f, i) => {
        files.push(`${p.id}-${i}.mp3`);
        expected.push(`### \`${p.id}-${i}.mp3\` · ${f.label.replace(' · ', ', ')} · até ${f.seconds} s`, '');
        for (const g of f.guide ?? [])
          expected.push(typeof g === 'string' ? `- ${g}` : `- *(vibrar ${g.times} vezes, puxando o ar entre elas)* **${g.intone}**`);
        expected.push('');
      });
    }
    const md = readFileSync('docs/roteiro-narracao.md', 'utf8');
    const body = md.slice(md.search(/^## .*\(`\w+`\)$/m));
    expect(body.trim()).toBe(expected.join('\n').trim());
    for (const f of readdirSync('public/audio/practices').filter((n) => n.endsWith('.mp3'))) expect(files).toContain(f);
  });
});

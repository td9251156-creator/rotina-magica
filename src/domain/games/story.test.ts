import { createRng } from './rng';
import { TRIGGERS } from '../routine';
import { MAX_URGE, START_URGE, TRIGGER_SCENES, buildStory, choose, commonTrigger, ending, isOver, provenCoping, startStory, storyScore, turningPoint, urgeHour } from './story';

describe('A noite (história)', () => {
  it('monta 5 cenas, sempre iguais para a mesma semente', () => {
    const a = buildStory(createRng(7));
    const b = buildStory(createRng(7));
    expect(a).toHaveLength(5);
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
    a.forEach((s) => expect(s.choices).toHaveLength(3));
  });

  it('usa o plano da pessoa nas opções', () => {
    const texts = Array.from({ length: 8 }, (_, i) => buildStory(createRng(i), { reason: 'ver meu filho crescer', plan: 'correr no parque' }))
      .flat()
      .flatMap((s) => s.choices.map((c) => c.text));
    expect(texts.some((t) => t.includes('ver meu filho crescer'))).toBe(true);
    expect(texts.some((t) => t.includes('correr no parque'))).toBe(true);
  });

  it('escolhas boas baixam a vontade e terminam a noite dormindo', () => {
    const scenes = buildStory(createRng(1));
    let s = startStory();
    for (const scene of scenes) {
      const best = [...scene.choices].sort((x, y) => x.delta - y.delta)[0];
      s = choose(s, scene, best);
    }
    expect(isOver(s, scenes)).toBe(true);
    expect(s.urge).toBeLessThan(START_URGE);
    expect(ending(s)).toBe('dormiu');
    expect(turningPoint(s)).toBeNull();
    expect(storyScore(s)).toBeGreaterThan(700);
  });

  it('a noite pode escapar antes do fim, e mostra onde mais pesou', () => {
    const scenes = buildStory(createRng(2));
    let s = startStory();
    while (!isOver(s, scenes)) {
      const worst = [...scenes[s.step].choices].sort((x, y) => y.delta - x.delta)[0];
      s = choose(s, scenes[s.step], worst);
    }
    expect(s.urge).toBe(MAX_URGE);
    expect(ending(s)).toBe('escapou');
    expect(turningPoint(s)?.delta).toBeGreaterThanOrEqual(2);
    expect(turningPoint(s)?.plan).toMatch(/^Se .+, então .+/);
    expect(storyScore(s)).toBe(0);
  });
});

describe('A noite aprende com os registros', () => {
  it('troca a cena da vontade pela do gatilho da pessoa, na hora de pico', () => {
    for (let seed = 0; seed < 6; seed++) {
      const scenes = buildStory(createRng(seed), { trigger: 'Solidão', peakHour: 20 });
      expect(scenes).toHaveLength(5);
      expect(scenes[2].id).toBe('gatilho-solidao');
      expect(scenes[2].time).toBe('20:00');
      expect(scenes[2].fromData).toMatch(/solidão/);
      expect(scenes[2].choices).toHaveLength(3);
    }
  });

  it('hora de pico fora da noite do ensaio fica às 21h', () => {
    expect(buildStory(createRng(1), { trigger: 'Tédio', peakHour: 15 })[2].time).toBe('21:00');
  });

  it('não repete o gatilho em outra cena', () => {
    const ids = Array.from({ length: 12 }, (_, i) => buildStory(createRng(i), { trigger: 'Oferta ou mensagem' }).map((s) => s.id)).flat();
    expect(ids).not.toContain('final-mensagem');
  });

  it('o que já funcionou entra como a melhor saída da cena', () => {
    const scene = buildStory(createRng(3), { coping: 'Mande um áudio para alguém' })[2];
    const best = [...scene.choices].sort((a, b) => a.delta - b.delta)[0];
    expect(best.text).toBe('Fazer o que já funcionou com você: Mande um áudio para alguém');
    expect(scene.choices).toHaveLength(3);
    expect(scene.fromData).toMatch(/já funcionou/);
  });

  it('cada gatilho do Diário tem cena com uma saída boa e uma ruim', () => {
    for (const t of TRIGGERS) {
      const scene = TRIGGER_SCENES[t];
      expect(scene, t).toBeDefined();
      expect(scene.choices.some((c) => c.delta < 0)).toBe(true);
      expect(scene.choices.some((c) => c.delta > 0)).toBe(true);
    }
  });

  it('lê gatilho, hora e ação que funcionou dos registros', () => {
    expect(commonTrigger([{ triggers: ['Tédio'] }])).toBeUndefined();
    expect(commonTrigger([{ triggers: ['Tédio', 'Raiva'] }, { triggers: ['Tédio'] }])).toBe('Tédio');
    const at = (h: number) => new Date(2026, 9, 10, h, 15).toISOString();
    expect(urgeHour([{ occurredAt: at(21) }, { occurredAt: at(21) }])).toBeUndefined();
    expect(urgeHour([{ occurredAt: at(21) }, { occurredAt: at(20) }, { occurredAt: at(21) }])).toBe(21);
    expect(
      provenCoping([
        { coping: 'sair', outcome: 'passou' },
        { coping: 'gente', outcome: 'passou' },
        { coping: 'gente', outcome: 'passou' },
        { coping: 'sair', outcome: 'usei' },
      ]),
    ).toBe('gente');
    expect(provenCoping([{ coping: 'sair', outcome: 'ainda_forte' }])).toBeUndefined();
  });
});

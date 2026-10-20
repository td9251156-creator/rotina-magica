import { createTestRepositories } from '@/data/test-repos';
import { supportFocus, saveWellbeingCheckin } from './support';
import { GENERAL_TECHNIQUES } from './wellbeing-techniques';
import { TECHNIQUES, techniqueOfTheDay } from './training';
import { GENERAL_APPROACHES, techniqueIds } from './therapies';

describe('acolhimento e compatibilidade', () => {
  it('acolhe novos usuários e conserva a experiência de quem já usava o app', () => {
    const repos = createTestRepositories();
    expect(supportFocus(repos)).toBe('general');
    repos.settings.set('onboardingDone', true);
    expect(supportFocus(repos)).toBe('recovery');
    repos.settings.set('supportFocus', 'general');
    expect(supportFocus(repos)).toBe('general');
  });

  it('salva humor e estresse sem converter ou apagar registros de uso e fissura', () => {
    const repos = createTestRepositories();
    repos.checkins.upsertForDate({ date: '2026-10-19', mood: 2, stress: 7, craving: 8, used: true, alcohol: true, sleepQuality: 2, note: 'Antes' });
    const journal = repos.journal.upsert({ date: '2026-10-19', craving: 9, triggers: ['Estresse'], breaks: 1, trick: null, victory: 'Uma caminhada' });
    saveWellbeingCheckin(repos, '2026-10-19', { mood: 3, stress: 5, note: 'Um pouco mais de espaço.' });
    expect(repos.checkins.getByDate('2026-10-19')).toMatchObject({ craving: 8, used: true, alcohol: true, sleepQuality: 2, stress: 5, note: 'Um pouco mais de espaço.' });
    expect(repos.journal.getByDate('2026-10-19')).toEqual(journal);
    repos.settings.set('supportFocus', 'general');
    repos.settings.set('supportFocus', 'recovery');
    expect(repos.checkins.getByDate('2026-10-19')?.used).toBe(true);
  });

  it('oferece oito vivências gerais, com referências válidas e histórico separado', () => {
    const ids = GENERAL_TECHNIQUES.map((t) => t.id);
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GENERAL_APPROACHES.flatMap(techniqueIds).sort()).toEqual([...ids].sort());
    expect(ids.some((id) => TECHNIQUES.some((t) => t.id === id))).toBe(false);
    expect(techniqueOfTheDay('2026-10-19', [], '2026-10-19', 'general').id).toBe('ancorar_sentidos');
    expect(techniqueOfTheDay('2026-10-19', ['ancorar_sentidos'], '2026-10-19', 'general').id).toBe('pausa_corpo');
  });
});

import { createTestRepositories, memoryStorage } from '../test-repos';
import { STORAGE_KEY, clearLocalData, createLocalRepositories, createResilientStorage, importData } from './local';

const emptyCheckin = { mood: null, craving: null, sleepQuality: null, stress: null, alcohol: null, used: null, note: null };

describe('repositórios locais', () => {
  it('apaga dados e cópias internas sem remover dados de outro app', () => {
    localStorage.setItem(STORAGE_KEY, 'principal');
    localStorage.setItem(`${STORAGE_KEY}:antes-de-restaurar`, 'anterior');
    localStorage.setItem(`${STORAGE_KEY}:corrompido:123`, 'cópia');
    localStorage.setItem('outro-app', 'preservar');
    clearLocalData(localStorage);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(`${STORAGE_KEY}:antes-de-restaurar`)).toBeNull();
    expect(localStorage.getItem(`${STORAGE_KEY}:corrompido:123`)).toBeNull();
    expect(localStorage.getItem('outro-app')).toBe('preservar');
  });
  it('mantém o SOS e os registros disponíveis na sessão com armazenamento bloqueado ou cheio', () => {
    const blocked = createResilientStorage(() => { throw new DOMException('Bloqueado', 'SecurityError'); });
    const repos = createLocalRepositories({ storage: blocked, newId: () => 'id-1', now: () => new Date() });
    repos.settings.set('trackingStartDate', '2026-10-16');
    expect(repos.settings.get('trackingStartDate', null)).toBe('2026-10-16');
    expect(blocked.failed).toBe(true);

    const full = createResilientStorage(() => ({
      getItem: () => null,
      setItem: () => { throw new DOMException('Cheio', 'QuotaExceededError'); },
    }));
    full.setItem(STORAGE_KEY, '{"version":1}');
    expect(full.getItem(STORAGE_KEY)).toBe('{"version":1}');
    expect(full.failed).toBe(true);
  });

  it('recusa coleções malformadas sem substituir os dados existentes', () => {
    const storage = memoryStorage();
    createTestRepositories(storage).settings.set('workEndTime', '17:00');
    const before = storage.getItem(STORAGE_KEY);
    expect(() => importData(storage, JSON.stringify({ app: 'rumo', data: { version: 1, settings: {}, journal: {} } }))).toThrow('danificado');
    expect(storage.getItem(STORAGE_KEY)).toBe(before);
  });
  it('não confirma restauração quando a gravação final falha', () => {
    const persisted = new Map<string, string>();
    let failMainWrite = false;
    const storage = createResilientStorage(() => ({
      getItem: (key) => persisted.get(key) ?? null,
      setItem: (key, value) => {
        if (failMainWrite && key === STORAGE_KEY) throw new DOMException('Cheio', 'QuotaExceededError');
        persisted.set(key, value);
      },
    }));
    const original = JSON.stringify({ version: 1, settings: { workEndTime: '17:00' } });
    persisted.set(STORAGE_KEY, original);
    const backup = JSON.stringify({ app: 'rumo', data: { version: 1, settings: { workEndTime: '18:00' } } });
    failMainWrite = true;

    expect(() => importData(storage, backup)).toThrow('gravar o backup restaurado');
    expect(persisted.get(STORAGE_KEY)).toBe(original);
    expect(persisted.get(`${STORAGE_KEY}:antes-de-restaurar`)).toBe(original);
  });
  it('mantém um check-in por dia e atualiza no lugar', () => {
    const repos = createTestRepositories();
    const first = repos.checkins.upsertForDate({ ...emptyCheckin, date: '2026-10-16', mood: 2 });
    const second = repos.checkins.upsertForDate({ ...emptyCheckin, date: '2026-10-16', mood: 4 });
    expect(second.id).toBe(first.id);
    expect(second.mood).toBe(4);
    expect(repos.checkins.listBetween('2026-10-01', '2026-10-31')).toHaveLength(1);
  });

  it('junta episódios, check-ins e fechamento da noite nos dias de uso, sem repetir', () => {
    const repos = createTestRepositories();
    repos.useEvents.add({ occurredAt: '2026-10-10T22:00:00', amountSpent: 100, note: null });
    repos.useEvents.add({ occurredAt: '2026-10-10T23:30:00', amountSpent: null, note: null });
    repos.checkins.upsertForDate({ ...emptyCheckin, date: '2026-10-12', used: true });
    repos.checkins.upsertForDate({ ...emptyCheckin, date: '2026-10-13', used: false });
    const plan = repos.plan.add({ kind: 'plano_noite', text: 'Ligar para alguém' });
    repos.evenings.choose('2026-10-13', plan.id);
    repos.evenings.setOutcome('2026-10-13', 'usei');
    expect(repos.useEvents.useDatesBetween('2026-10-01', '2026-10-31')).toEqual(['2026-10-10', '2026-10-12', '2026-10-13']);
  });

  it('exclusão é lógica: some das consultas, mas fica registrada', () => {
    const storage = memoryStorage();
    const repos = createTestRepositories(storage);
    const e = repos.useEvents.add({ occurredAt: '2026-10-10T22:00:00', amountSpent: null, note: null });
    repos.useEvents.remove(e.id);
    expect(repos.useEvents.useDatesBetween('2026-10-01', '2026-10-31')).toEqual([]);
    expect(storage.data.get(STORAGE_KEY)).toContain('"deletedAt":"2026');
  });

  it('registra e atualiza uma fissura com o dia local', () => {
    const repos = createTestRepositories();
    const c = repos.cravings.add({
      occurredAt: '2026-10-16T19:10:00',
      intensity: 8,
      intensityAfter: null,
      trigger: 'tedio',
      coping: null,
      outcome: 'em_andamento',
      note: null,
    });
    expect(c.date).toBe('2026-10-16');
    expect(repos.cravings.update(c.id, { outcome: 'passou', intensityAfter: 3 })).toMatchObject({ outcome: 'passou', intensity: 8 });
  });

  it('ordena e reordena itens do plano por tipo', () => {
    const repos = createTestRepositories();
    const a = repos.plan.add({ kind: 'razao', text: 'Minha saúde' });
    const b = repos.plan.add({ kind: 'razao', text: 'Dinheiro' });
    repos.plan.add({ kind: 'atividade', text: 'Academia', extra: { minutos: 40 } });
    expect(repos.plan.list('razao').map((i) => i.text)).toEqual(['Minha saúde', 'Dinheiro']);
    repos.plan.reorder('razao', [b.id, a.id]);
    expect(repos.plan.list('razao').map((i) => i.text)).toEqual(['Dinheiro', 'Minha saúde']);
    expect(repos.plan.list('atividade')[0].extra).toEqual({ minutos: 40 });
  });

  it('guarda o plano da noite, permite trocar e registrar como foi', () => {
    const repos = createTestRepositories();
    const a = repos.plan.add({ kind: 'plano_noite', text: 'Academia' });
    const b = repos.plan.add({ kind: 'plano_noite', text: 'Comer fora' });
    repos.evenings.choose('2026-10-16', a.id);
    expect(repos.evenings.choose('2026-10-16', b.id).planItemId).toBe(b.id);
    expect(repos.evenings.setOutcome('2026-10-16', 'sem_uso').outcome).toBe('sem_uso');
    expect(() => repos.evenings.setOutcome('2026-10-17', 'usei')).toThrow();
  });

  it('persiste entre aberturas do app', () => {
    const storage = memoryStorage();
    createTestRepositories(storage).settings.set('workEndTime', '18:30');
    expect(createTestRepositories(storage).settings.get('workEndTime', '18:00')).toBe('18:30');
  });

  it('não trava com dado corrompido: guarda cópia e recomeça', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{quebrado');
    const repos = createTestRepositories(storage);
    expect(repos.settings.get('onboardingDone', false)).toBe(false);
    expect([...storage.data.keys()].some((k) => k.includes('corrompido'))).toBe(true);
  });
});

describe('treinos, noites e backup', () => {
  it('lista treinos e noites e sabe o último uso', () => {
    const repos = createTestRepositories();
    repos.practices.add('filme', '2026-10-16');
    expect(repos.practices.list().map((p) => p.techniqueId)).toEqual(['filme']);
    const plan = repos.plan.add({ kind: 'plano_noite', text: 'Academia' });
    repos.evenings.choose('2026-10-15', plan.id);
    repos.evenings.choose('2026-10-16', plan.id);
    expect(repos.evenings.listBetween('2026-10-16', '2026-10-16')).toHaveLength(1);
    expect(repos.useEvents.lastOccurredAt()).toBeNull();
    repos.useEvents.add({ occurredAt: '2026-10-10T22:00:00', amountSpent: null, note: null });
    repos.useEvents.add({ occurredAt: '2026-10-12T22:00:00', amountSpent: null, note: null });
    expect(repos.useEvents.lastOccurredAt()).toBe('2026-10-12T22:00:00');
  });

  it('exporta e restaura um backup; recusa arquivo estranho sem mexer em nada', async () => {
    const { exportData, importData } = await import('./local');
    const a = memoryStorage();
    createTestRepositories(a).plan.add({ kind: 'razao', text: 'Minha saúde' });
    const backup = exportData(a, new Date('2026-10-16T12:00:00'));

    const b = memoryStorage();
    createTestRepositories(b).settings.set('workEndTime', '17:00');
    expect(() => importData(b, '{"app":"outro"}')).toThrow('Arquivo não é um backup do Rumo');
    expect(createTestRepositories(b).settings.get('workEndTime', '')).toBe('17:00');

    importData(b, backup);
    expect(createTestRepositories(b).plan.list('razao').map((i) => i.text)).toEqual(['Minha saúde']);
    expect(b.data.has(`${STORAGE_KEY}:antes-de-restaurar`)).toBe(true);
  });
});

describe('partidas', () => {
  it('guarda e lista partidas; dados antigos sem partidas continuam abrindo', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, settings: { onboardingDone: true }, checkins: [], cravings: [], useEvents: [], planItems: [], eveningChoices: [] }));
    const repos = createTestRepositories(storage);
    expect(repos.games.list()).toEqual([]);
    repos.games.add({ date: '2026-10-16', gameId: 'desvia', score: 320, xp: 40, durationMs: 45000, extra: { hits: 20 } });
    expect(createTestRepositories(storage).games.list()[0]).toMatchObject({ gameId: 'desvia', score: 320 });
    expect(repos.practices.list()).toEqual([]);
  });
});

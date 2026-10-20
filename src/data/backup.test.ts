import { makeBackup, restoreBackup } from './backup';
import { STORAGE_KEY, exportData } from './repositories/local';
import { createTestRepositories, memoryStorage } from './test-repos';

describe('backup com senha', () => {
  it('cifra, pede a senha e restaura sem trazer o PIN', async () => {
    const from = memoryStorage();
    const repos = createTestRepositories(from);
    repos.plan.add({ kind: 'razao', text: 'minha filha' });
    repos.settings.set('pinHash', 'abc');
    repos.settings.set('pinSalt', 'def');
    const file = await makeBackup(from, new Date(), 'senha boa');
    expect(file).not.toContain('minha filha');

    const to = memoryStorage();
    await expect(restoreBackup(to, file)).rejects.toThrow('tem senha');
    await expect(restoreBackup(to, file, 'errada')).rejects.toThrow('Senha errada');
    await restoreBackup(to, file, 'senha boa');
    const restored = createTestRepositories(to);
    expect(restored.plan.list('razao').map((i) => i.text)).toEqual(['minha filha']);
    expect(restored.settings.get('pinHash', null)).toBeNull();
    expect(to.getItem(STORAGE_KEY)).toContain('minha filha');
  });

  it('a exportação exige senha, mas backups antigos sem senha ainda podem ser restaurados', async () => {
    const from = memoryStorage();
    createTestRepositories(from).plan.add({ kind: 'razao', text: 'saúde' });
    const to = memoryStorage();
    await expect(makeBackup(from, new Date(), 'curta')).rejects.toThrow('pelo menos 8');
    await restoreBackup(to, exportData(from, new Date()));
    expect(createTestRepositories(to).plan.list('razao')).toHaveLength(1);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider } from '@/data/provider';
import { createTestRepositories } from '@/data/test-repos';
import { restoreBackup } from '@/data/backup';
import { Settings } from './Settings';

vi.mock('@/data/backup', () => ({ restoreBackup: vi.fn(), makeBackup: vi.fn() }));

it('permite cancelar a substituição e selecionar o mesmo arquivo após corrigir a senha', async () => {
  const repos = createTestRepositories();
  repos.settings.set('letter', 'Carta fictícia guardada');
  const view = render(<DataProvider repos={repos}><Settings onBack={() => {}} onEditPlans={() => {}} /></DataProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByText('Seus dados'));
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const file = new File(['{}'], 'backup.json', { type: 'application/json' });
  const read = vi.fn().mockResolvedValue('{}');
  Object.defineProperty(file, 'text', { value: read });
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  vi.mocked(restoreBackup).mockRejectedValue(new Error('Senha errada ou arquivo danificado'));
  try {
    await user.upload(input, file);
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('substituir os dados atuais'));
    expect(read).not.toHaveBeenCalled();
    expect(restoreBackup).not.toHaveBeenCalled();
    expect(input.value).toBe('');
    expect(repos.settings.get('letter', '')).toBe('Carta fictícia guardada');
    confirm.mockReturnValue(true);
    await user.upload(input, file);
    expect(await screen.findByText('Senha errada ou arquivo danificado')).toBeInTheDocument();
    expect(restoreBackup).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('');
    await user.type(screen.getByLabelText(/Senha do backup/), 'senha-ficticia');
    await user.upload(input, file);
    expect(restoreBackup).toHaveBeenCalledTimes(2);
    expect(restoreBackup).toHaveBeenLastCalledWith(expect.anything(), '{}', 'senha-ficticia');
  } finally {
    confirm.mockRestore();
    vi.mocked(restoreBackup).mockReset();
  }
});

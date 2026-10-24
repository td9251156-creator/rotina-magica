import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { DataProvider } from '@/data/provider';
import { createTestRepositories } from '@/data/test-repos';
import * as binaural from '@/platform/binaural';

function setup() {
  const repos = createTestRepositories();
  repos.settings.set('onboardingDone', true);
  repos.settings.set('supportFocus', 'general');
  window.location.hash = '';
  render(<DataProvider repos={repos}><App /></DataProvider>);
  return { repos, user: userEvent.setup() };
}

afterEach(() => vi.restoreAllMocks());

it('rotina para dormir: quarto, soltar o corpo e som que some sozinho', async () => {
  vi.spyOn(binaural, 'canPlayBinaural').mockReturnValue(true);
  const start = vi.spyOn(binaural, 'startBinaural').mockImplementation(() => {});
  const stop = vi.spyOn(binaural, 'stopBinaural').mockImplementation(() => {});
  const { repos, user } = setup();
  await user.click(screen.getByRole('button', { name: /Rotina para dormir/ }));
  expect(await screen.findByRole('heading', { name: 'Rotina para dormir' })).toBeInTheDocument();
  const light = screen.getByRole('button', { name: 'Luz baixa ou apagada' });
  await user.click(light);
  expect(light).toHaveAttribute('aria-pressed', 'true');

  await user.click(screen.getByRole('button', { name: 'Começar' }));
  expect(screen.getByText('Preparar o corpo para dormir')).toBeInTheDocument();
  while (!screen.queryByRole('button', { name: 'Seguir para o som' })) {
    await user.click(screen.getByRole('button', { name: /^(Continuar|Pular|Concluir)$/ }));
  }
  expect(repos.practices.list().map((p) => p.techniqueId)).toContain('preparar_sono');
  await user.click(screen.getByRole('button', { name: 'Seguir para o som' }));

  await user.click(screen.getByRole('button', { name: 'Tocar 30 min' }));
  expect(start).toHaveBeenCalledWith(expect.objectContaining({ id: 'sono' }), 30, true);
  await user.click(screen.getByRole('button', { name: /Parar · faltam/ }));
  expect(stop).toHaveBeenCalled();
});

it('pode ir direto ao som e sair em silêncio', async () => {
  vi.spyOn(binaural, 'canPlayBinaural').mockReturnValue(false);
  const { user } = setup();
  window.location.hash = '#dormir';
  await user.click(await screen.findByRole('button', { name: 'Ir direto ao som' }));
  expect(screen.getByText(/não toca som gerado/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /Prefiro silêncio/ }));
  expect(window.location.hash).toBe('');
});

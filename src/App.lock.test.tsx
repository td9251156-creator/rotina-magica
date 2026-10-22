import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DataProvider } from './data/provider';
import { createTestRepositories } from './data/test-repos';
import { hashPin, randomBytes, toBase64 } from './platform/crypto';

async function open(focus: 'general' | 'recovery', pin = true) {
  const repos = createTestRepositories();
  repos.settings.set('onboardingDone', true);
  repos.settings.set('supportFocus', focus);
  repos.settings.set('letter', 'Carta fictícia guardada');
  if (pin) {
    const salt = randomBytes(16);
    repos.settings.set('pinSalt', toBase64(salt));
    repos.settings.set('pinHash', await hashPin('2580', salt));
  }
  window.location.hash = '#sos';
  const user = userEvent.setup();
  // Entrar por uma rota privada para desbloquear antes de começar a pausa.
  if (pin) window.location.hash = '#diario';
  render(<DataProvider repos={repos}><App /></DataProvider>);
  if (pin) {
    await user.type(screen.getByLabelText('Digite seu PIN'), '2580');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByRole('heading', { name: focus === 'general' ? 'Seu diário' : 'Diário' });
    act(() => { window.location.hash = '#sos'; });
  }
  await screen.findByText('Carta fictícia guardada');
  return { repos, user };
}

function returnAfter(ms: number) {
  const start = Date.now();
  const clock = vi.spyOn(Date, 'now').mockReturnValue(start);
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  try {
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    clock.mockReturnValue(start + ms);
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
  } finally {
    clock.mockRestore();
    hidden.mockRestore();
  }
}

it('esconde o rascunho da Pausa ao rebloquear e mantém a ajuda sem PIN', async () => {
  const { repos, user } = await open('general');
  await user.click(screen.getByRole('button', { name: /Dar espaço ao que passa/ }));
  await user.type(screen.getByRole('textbox'), 'Reflexão fictícia privada');

  returnAfter(121_000);

  expect(screen.queryByDisplayValue('Reflexão fictícia privada')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Vamos cuidar deste momento.' })).toBeInTheDocument();
  expect(screen.queryByText('Carta fictícia guardada')).not.toBeInTheDocument();
  expect(repos.settings.get('letter', '')).toBe('Carta fictícia guardada');
  expect(repos.practices.list()).toHaveLength(0);
  expect(repos.plan.list()).toHaveLength(0);
  await user.click(screen.getByRole('button', { name: /Dar espaço ao que passa/ }));
  expect(screen.getByRole('textbox')).toHaveValue('');
  await user.click(screen.getByRole('button', { name: '← Voltar' }));
  await user.click(screen.getByRole('button', { name: 'Voltar para entrar com PIN' }));
  expect(await screen.findByLabelText('Digite seu PIN')).toBeInTheDocument();
});

it('esconde o ajuste em andamento ao rebloquear o registro de uso sem apagar o registro salvo', async () => {
  const { repos, user } = await open('recovery');
  await user.click(screen.getByRole('button', { name: 'Usei' }));
  await user.click(await screen.findByRole('button', { name: 'Agora há pouco' }));
  const recorded = repos.useEvents.lastOccurredAt();
  await user.click(screen.getByRole('button', { name: /Entender o que houve/ }));
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  await user.clear(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'Ajuste fictício privado');

  returnAfter(121_000);

  expect(screen.queryByDisplayValue('Ajuste fictício privado')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Registrar que usou' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Já registrei/ })).not.toBeInTheDocument();
  expect(recorded).not.toBeNull();
  expect(repos.useEvents.lastOccurredAt()).toBe(recorded);
  expect(repos.plan.list()).toHaveLength(0);
});

it('limpa a avaliação da sessão anterior ao rebloquear a ajuda de recuperação', async () => {
  const { user } = await open('recovery');
  await user.click(within(screen.getByRole('group', { name: 'Vontade agora' })).getByRole('button', { name: '8' }));
  returnAfter(121_000);
  expect(within(screen.getByRole('group', { name: 'Vontade agora' })).getByRole('button', { name: '8' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.queryByText('Carta fictícia guardada')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Jogar Blocos/ })).toBeInTheDocument();
});

it.each([{ pin: true, away: 60_000 }, { pin: false, away: 121_000 }])(
  'preserva a pausa quando não há rebloqueio (PIN $pin, ausência $away ms)',
  async ({ pin, away }) => {
    const { user } = await open('general', pin);
    await user.click(screen.getByRole('button', { name: /Dar espaço ao que passa/ }));
    await user.type(screen.getByRole('textbox'), 'Reflexão fictícia em andamento');
    returnAfter(away);
    expect(screen.getByRole('textbox')).toHaveValue('Reflexão fictícia em andamento');
  },
);

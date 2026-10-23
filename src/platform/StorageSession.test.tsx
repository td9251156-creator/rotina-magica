import { StrictMode, useState } from 'react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createLocalRepositories, clearLocalData, STORAGE_KEY } from '@/data/repositories/local';
import { StorageSession } from './StorageSession';

const open = () => createLocalRepositories({ storage: localStorage, newId: () => crypto.randomUUID(), now: () => new Date() });
const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks');

/** Posse exclusiva como navigator.locks entre documentos: `ifAvailable` não espera e `steal` toma a posse. */
function locks() {
  let holder: { reject: (error: unknown) => void } | null = null;
  return { request: vi.fn((_name: string, options: LockOptions, callback: (lock: Lock | null) => Promise<void>) => new Promise<void>((resolve, reject) => {
    if (holder && !options.steal) { Promise.resolve(callback(null)).then(resolve, reject); return; }
    holder?.reject(new DOMException('Tomada por outra janela', 'AbortError'));
    const me = { reject };
    holder = me;
    Promise.resolve().then(() => callback({ name: _name, mode: 'exclusive' } as Lock)).then(resolve, reject).finally(() => { if (holder === me) holder = null; });
  })) };
}

function Editor() {
  const [repos] = useState(open);
  return <section aria-label="Registros">
    <p>{repos.settings.get('letter', 'Sem carta')}</p>
    <p>{repos.settings.get('pinHash', 'Sem PIN')}</p>
    <button onClick={() => repos.settings.set('letter', 'Carta fictícia nova')}>Salvar carta</button>
    <button onClick={() => { repos.settings.set('pinHash', 'hash-ficticio'); repos.settings.set('pinSalt', 'salt-ficticio'); }}>Ativar PIN</button>
    <button onClick={() => repos.settings.set('theme', 'claro')}>Mudar tema</button>
    <button onClick={() => clearLocalData(localStorage)}>Apagar dados</button>
  </section>;
}

beforeEach(() => { Object.defineProperty(navigator, 'locks', { configurable: true, value: locks() }); });
afterEach(() => {
  cleanup();
  if (originalLocks) Object.defineProperty(navigator, 'locks', originalLocks);
  else Reflect.deleteProperty(navigator, 'locks');
});

it('a janela aberta depois assume os registros e a anterior sai da tela', async () => {
  const user = userEvent.setup();
  const a = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  await within(a.container).findByRole('region', { name: 'Registros' });
  await user.click(within(a.container).getByRole('button', { name: 'Salvar carta' }));
  const b = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  expect(await within(b.container).findByText('Carta fictícia nova')).toBeInTheDocument();
  expect(await within(a.container).findByRole('heading', { name: 'O app foi aberto em outra janela' })).toBeInTheDocument();
  expect(within(a.container).queryByRole('region')).not.toBeInTheDocument();
  expect(within(a.container).getByRole('button', { name: 'Usar aqui' })).toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: 'Mudar tema' }));
  expect(open().settings.get('letter', '')).toBe('Carta fictícia nova');
});

it('uma janela em segundo plano espera ficar visível para assumir', async () => {
  const a = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  const b = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
  expect(within(b.container).queryByRole('region')).not.toBeInTheDocument();
  expect(within(a.container).getByRole('region')).toBeInTheDocument();
  visibility.mockReturnValue('visible');
  act(() => { document.dispatchEvent(new Event('visibilitychange')); });
  expect(await within(b.container).findByRole('region')).toBeInTheDocument();
  visibility.mockRestore();
});

it('não deixa a janela nova remover o PIN criado pela anterior', async () => {
  const user = userEvent.setup();
  const a = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  await user.click(within(a.container).getByRole('button', { name: 'Ativar PIN' }));
  const b = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  expect(await within(b.container).findByText('hash-ficticio')).toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: 'Mudar tema' }));
  expect(open().settings.get('pinHash', '')).toBe('hash-ficticio');
});

it('não ressuscita conteúdo apagado quando a janela nova assume', async () => {
  open().settings.set('letter', 'Texto fictício a apagar');
  const user = userEvent.setup();
  const a = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  await user.click(within(a.container).getByRole('button', { name: 'Apagar dados' }));
  const b = render(<StorageSession graceMs={0}><Editor /></StorageSession>);
  expect(await within(b.container).findByText('Sem carta')).toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: 'Mudar tema' }));
  expect(open().settings.get('letter', null)).toBeNull();
});

it('oferece uma pausa temporária sem consultar ou alterar os dados pessoais', async () => {
  open().settings.set('letter', 'Texto fictício privado');
  const a = render(<StorageSession><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  const before = localStorage.getItem(STORAGE_KEY);
  const b = render(<StorageSession graceMs={60_000}><Editor /></StorageSession>);
  const user = userEvent.setup();
  await user.click(within(b.container).getByRole('button', { name: 'Preciso de uma pausa agora' }));
  expect(within(b.container).queryByText('Texto fictício privado')).not.toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: /Dar espaço ao que passa/ }));
  await user.type(within(b.container).getByRole('textbox'), 'Rascunho fictício temporário');
  expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
});

it('retira os registros da tela se outra versão mudar ou apagar o armazenamento', async () => {
  open().settings.set('letter', 'Texto fictício privado');
  render(<StorageSession><Editor /></StorageSession>);
  await screen.findByText('Texto fictício privado');
  act(() => { window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY })); });
  expect(screen.queryByText('Texto fictício privado')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reabrir o app' })).toBeInTheDocument();
});

it('mantém a pausa disponível se o navegador não oferece coordenação segura', async () => {
  Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined });
  render(<StorageSession><Editor /></StorageSession>);
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Preciso de uma pausa agora' }));
  expect(screen.getByRole('heading', { name: 'Vamos cuidar deste momento.' })).toBeInTheDocument();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});

it('cancela pedidos pendentes e libera a sessão no StrictMode', async () => {
  render(<StrictMode><StorageSession><Editor /></StorageSession></StrictMode>);
  expect(await screen.findByRole('region')).toBeInTheDocument();
});

it('demonstração não disputa a sessão nem abre o armazenamento real', () => {
  render(<StorageSession bypass><p>Demonstração</p></StorageSession>);
  expect(screen.getByText('Demonstração')).toBeInTheDocument();
  expect(navigator.locks.request).not.toHaveBeenCalled();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});

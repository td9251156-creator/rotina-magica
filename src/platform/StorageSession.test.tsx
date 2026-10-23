import { StrictMode, useState } from 'react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createLocalRepositories, clearLocalData, STORAGE_KEY } from '@/data/repositories/local';
import { StorageSession } from './StorageSession';

const open = () => createLocalRepositories({ storage: localStorage, newId: () => crypto.randomUUID(), now: () => new Date() });
const originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks');

/** Mutex assíncrono com cancelamento, como navigator.locks entre documentos. */
function locks() {
  let held = false;
  const queue: (() => void)[] = [];
  const pump = () => { if (!held) queue.shift()?.(); };
  return { request: vi.fn((_name: string, options: LockOptions, callback: () => Promise<void>) => new Promise<void>((resolve, reject) => {
    const start = () => {
      options.signal?.removeEventListener('abort', cancel);
      if (options.signal?.aborted) { reject(new DOMException('Abortado', 'AbortError')); pump(); return; }
      held = true;
      Promise.resolve().then(callback).then(resolve, reject).finally(() => { held = false; pump(); });
    };
    const cancel = () => {
      const index = queue.indexOf(start);
      if (index >= 0) queue.splice(index, 1);
      reject(new DOMException('Abortado', 'AbortError'));
    };
    options.signal?.addEventListener('abort', cancel, { once: true });
    queue.push(start);
    queueMicrotask(pump);
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

it('a segunda aba só carrega os registros depois de a primeira fechar', async () => {
  const user = userEvent.setup();
  const a = render(<StorageSession><Editor /></StorageSession>);
  await within(a.container).findByRole('region', { name: 'Registros' });
  const b = render(<StorageSession><Editor /></StorageSession>);
  expect(within(b.container).queryByRole('region')).not.toBeInTheDocument();
  await user.click(within(a.container).getByRole('button', { name: 'Salvar carta' }));
  a.unmount();
  expect(await within(b.container).findByText('Carta fictícia nova')).toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: 'Mudar tema' }));
  expect(open().settings.get('letter', '')).toBe('Carta fictícia nova');
});

it('não deixa a aba que esperava remover o PIN criado pela primeira', async () => {
  const user = userEvent.setup();
  const a = render(<StorageSession><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  const b = render(<StorageSession><Editor /></StorageSession>);
  await user.click(within(a.container).getByRole('button', { name: 'Ativar PIN' }));
  a.unmount();
  expect(await within(b.container).findByText('hash-ficticio')).toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: 'Mudar tema' }));
  expect(open().settings.get('pinHash', '')).toBe('hash-ficticio');
});

it('não ressuscita conteúdo apagado quando a aba que esperava assume', async () => {
  open().settings.set('letter', 'Texto fictício a apagar');
  const user = userEvent.setup();
  const a = render(<StorageSession><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  const b = render(<StorageSession><Editor /></StorageSession>);
  await user.click(within(a.container).getByRole('button', { name: 'Apagar dados' }));
  a.unmount();
  expect(await within(b.container).findByText('Sem carta')).toBeInTheDocument();
  await user.click(within(b.container).getByRole('button', { name: 'Mudar tema' }));
  expect(open().settings.get('letter', null)).toBeNull();
});

it('oferece uma pausa temporária sem consultar ou alterar os dados pessoais', async () => {
  open().settings.set('letter', 'Texto fictício privado');
  const a = render(<StorageSession><Editor /></StorageSession>);
  await within(a.container).findByRole('region');
  const before = localStorage.getItem(STORAGE_KEY);
  const b = render(<StorageSession><Editor /></StorageSession>);
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

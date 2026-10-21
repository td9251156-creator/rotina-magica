import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

type Listener = (event: any) => void;

function harness(network: (request: any) => Promise<Response> = async () => new Response('rede')) {
  const listeners = new Map<string, Listener>();
  const batches: string[][] = [];
  const added: string[] = [];
  const deleted: string[] = [];
  const stored: Array<[string, Response]> = [];
  let skipped = 0;
  const scope = 'https://example.github.io/rotina-magica/';
  const manifest = {
    'index.html': { file: 'assets/index.js', css: ['assets/index.css'] },
    'src/features/lab/Lab.tsx': { file: 'assets/Lab.js' },
  };
  const cache = {
    addAll: async (urls: string[]) => { batches.push(urls); },
    add: async (url: string) => { added.push(url); },
    match: async () => new Response(JSON.stringify(manifest), { headers: { 'content-type': 'application/json' } }),
    put: async (key: string, response: Response) => { stored.push([key, response]); },
  };
  const caches = {
    open: async () => cache,
    match: async () => new Response('offline shell', { headers: { 'content-type': 'text/html' } }),
    keys: async () => ['rumo-v8', 'rumo-v9', 'outro-app-v2'],
    delete: async (key: string) => { deleted.push(key); return true; },
  };
  const self = {
    addEventListener: (name: string, callback: Listener) => listeners.set(name, callback),
    skipWaiting: async () => { skipped += 1; },
    clients: { claim: async () => {} },
    registration: { scope },
    location: { origin: 'https://example.github.io', href: `${scope}sw.js?v=build-123` },
  };
  runInNewContext(readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8'), { self, caches, URL, Promise, Response, fetch: network });
  return { listeners, batches, added, deleted, stored, scope, skipped: () => skipped };
}

async function lifecycle(listener: Listener) {
  let pending: Promise<unknown> = Promise.resolve();
  listener({ waitUntil: (promise: Promise<unknown>) => { pending = promise; } });
  await pending;
}

it('instala o shell sem assumir o controle de uma aba antiga', async () => {
  const h = harness();
  await lifecycle(h.listeners.get('install')!);
  expect(h.batches[0]).toContain('./assets-manifest.json');
  expect(h.batches[0]).toContain('./illustrations/welcome.webp');
  expect(h.added).toContain(`${h.scope}assets/Lab.js`);
  expect(h.added).toContain(`${h.scope}assets/index.css`);
  expect(h.skipped()).toBe(0);

  await lifecycle(h.listeners.get('activate')!);
  expect(h.deleted).toEqual(['rumo-v8', 'rumo-v9']);
});

it('só ativa imediatamente quando a pessoa pede a atualização', () => {
  const h = harness();
  h.listeners.get('message')!({ data: { type: 'OUTRA_MENSAGEM' } });
  expect(h.skipped()).toBe(0);
  h.listeners.get('message')!({ data: { type: 'SKIP_WAITING' } });
  expect(h.skipped()).toBe(1);
});

it('não troca o shell offline por respostas 404', async () => {
  const h = harness(async () => new Response('não encontrado', { status: 404, headers: { 'content-type': 'text/html' } }));
  let response!: Promise<Response>;
  const waits: Promise<unknown>[] = [];
  h.listeners.get('fetch')!({
    request: { method: 'GET', mode: 'navigate', url: `${h.scope}rota` },
    respondWith: (promise: Promise<Response>) => { response = promise; },
    waitUntil: (promise: Promise<unknown>) => waits.push(promise),
  });
  expect(await (await response).text()).toBe('offline shell');
  await Promise.all(waits);
  expect(h.stored).toHaveLength(0);
});

it('guarda somente uma navegação HTML válida e usa o shell quando a rede falha', async () => {
  const online = harness(async () => new Response('<html>nova</html>', { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }));
  let response!: Promise<Response>;
  const waits: Promise<unknown>[] = [];
  online.listeners.get('fetch')!({ request: { method: 'GET', mode: 'navigate', url: `${online.scope}rota` }, respondWith: (p: Promise<Response>) => { response = p; }, waitUntil: (p: Promise<unknown>) => waits.push(p) });
  expect(await (await response).text()).toContain('nova');
  await Promise.all(waits);
  expect(online.stored[0][0]).toBe('./index.html');

  const offline = harness(async () => { throw new Error('offline'); });
  offline.listeners.get('fetch')!({ request: { method: 'GET', mode: 'navigate', url: `${offline.scope}rota` }, respondWith: (p: Promise<Response>) => { response = p; }, waitUntil: () => {} });
  expect(await (await response).text()).toBe('offline shell');
});

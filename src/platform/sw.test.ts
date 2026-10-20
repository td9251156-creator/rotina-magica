import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

it('guarda os blocos de código para uso offline e apaga só caches do próprio app', async () => {
  const listeners = new Map<string, (event: { waitUntil: (promise: Promise<unknown>) => void }) => void>();
  const batches: string[][] = [];
  const deleted: string[] = [];
  const scope = 'https://example.github.io/rotina-magica/';
  const manifest = {
    'index.html': { file: 'assets/index.js', css: ['assets/index.css'] },
    'src/features/lab/Lab.tsx': { file: 'assets/Lab.js' },
  };
  const cache = {
    addAll: async (urls: string[]) => { batches.push(urls); },
    match: async () => ({ json: async () => manifest }),
  };
  const caches = {
    open: async () => cache,
    keys: async () => ['rumo-v6', 'rumo-v7', 'outro-app-v2'],
    delete: async (key: string) => { deleted.push(key); return true; },
  };
  const self = {
    addEventListener: (name: string, callback: (event: { waitUntil: (promise: Promise<unknown>) => void }) => void) => listeners.set(name, callback),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
    registration: { scope },
    location: { origin: 'https://example.github.io' },
  };
  runInNewContext(readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8'), { self, caches, URL });

  let pending: Promise<unknown> = Promise.resolve();
  const event = { waitUntil: (promise: Promise<unknown>) => { pending = promise; } };
  listeners.get('install')!(event);
  await pending;
  expect(batches[0]).toContain('./assets-manifest.json');
  expect(batches[1]).toContain(`${scope}assets/Lab.js`);
  expect(batches[1]).toContain(`${scope}assets/index.css`);

  listeners.get('activate')!(event);
  await pending;
  expect(deleted).toEqual(['rumo-v6']);
});

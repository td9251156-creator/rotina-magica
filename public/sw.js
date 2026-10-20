// Service worker do Rumo: guarda o app no celular para abrir sem internet.
// Estratégia: rede primeiro para a página (pega versão nova quando há conexão), cache para o resto.
// Os dados da pessoa NÃO passam por aqui: ficam no armazenamento local do navegador.
const CACHE = 'rumo-v7';
const SHELL = ['./', './index.html', './manifest.webmanifest', './assets-manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // As telas secundárias chegam depois do primeiro carregamento, mas também precisam abrir offline.
    const response = await cache.match('./assets-manifest.json');
    const manifest = await response.json();
    const files = new Set(Object.values(manifest).flatMap((entry) => [entry.file, ...(entry.css || []), ...(entry.assets || [])]));
    await cache.addAll([...files].map((file) => new URL(file, self.registration.scope).href));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('rumo-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  // Áudio narrado: o navegador pede pedaços do arquivo (Range); guarda o arquivo inteiro para tocar sem internet.
  if (/\.mp3$/.test(new URL(req.url).pathname)) {
    event.respondWith(
      caches.match(req.url).then(
        (hit) =>
          hit ||
          fetch(req.url).then((res) => {
            if (res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req.url, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});

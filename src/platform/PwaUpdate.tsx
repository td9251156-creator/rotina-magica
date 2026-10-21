import { useEffect, useRef, useState } from 'react';

/** Mantém a versão aberta estável e entrega a atualização somente após escolha da pessoa. */
export function PwaUpdate() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);
  const reloadOnChange = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
    const controllerChanged = () => {
      if (reloadOnChange.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', controllerChanged);
    const reveal = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker);
        });
      });
    };
    const register = () => {
      const build = import.meta.env.VITE_BUILD_SHA || 'local';
      navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(build)}`).then(reveal).catch(() => {
        // Sem service worker o app continua disponível enquanto houver rede.
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => {
      window.removeEventListener('load', register);
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChanged);
    };
  }, []);

  if (!waiting) return null;
  return <aside className="pwa-update" role="status"><span>Uma atualização está pronta.</span><button type="button" className="btn btn--ghost" disabled={updating} onClick={() => {
    setUpdating(true);
    // controllerchange recarrega somente depois deste pedido explícito.
    reloadOnChange.current = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }}>{updating ? 'Atualizando…' : 'Atualizar agora'}</button></aside>;
}

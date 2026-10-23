import { useEffect, useState, type ReactNode } from 'react';
import { DataProvider } from '@/data/provider';
import { createLocalRepositories, STORAGE_KEY } from '@/data/repositories/local';
import { WellbeingSupport } from '@/features/wellbeing/Wellbeing';

// Uma aba mantém a posse durante a sessão. A próxima só carrega os dados depois da liberação.
export const STORAGE_SESSION_LOCK = `${STORAGE_KEY}:sessao`;

function TemporaryPause({ onBack }: { onBack: () => void }) {
  const [repos] = useState(() => createLocalRepositories({
    storage: { getItem: () => null, setItem: () => {} },
    newId: () => crypto.randomUUID(), now: () => new Date(),
  }));
  return <DataProvider repos={repos}>
    <p className="storage-warning" role="status">Esta pausa não acessa seus registros e não salva respostas.</p>
    <button type="button" className="btn btn--ghost" onClick={onBack}>Voltar ao aplicativo</button>
    <WellbeingSupport locked />
  </DataProvider>;
}

/** Serializa sessões, inclusive entre a PWA instalada e abas da mesma origem. */
export function StorageSession({ children, bypass = false }: { children: ReactNode; bypass?: boolean }) {
  const [status, setStatus] = useState<'waiting' | 'active' | 'changed' | 'unavailable'>('waiting');
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (bypass) return;
    if (!navigator.locks?.request) { setStatus('unavailable'); return; }
    const abort = new AbortController();
    let disposed = false;
    let release = () => {};
    const held = new Promise<void>((resolve) => { release = resolve; });
    const changed = (event: StorageEvent) => {
      // Inclui exclusão total; versões antigas não participam da coordenação.
      if (event.key === STORAGE_KEY || event.key === null) { setStatus('changed'); release(); }
    };
    void navigator.locks.request(STORAGE_SESSION_LOCK, { signal: abort.signal }, async () => {
      if (disposed) return;
      window.addEventListener('storage', changed);
      setStatus('active');
      await held;
      window.removeEventListener('storage', changed);
    }).catch(() => { if (!disposed) setStatus('unavailable'); });
    return () => {
      disposed = true;
      abort.abort();
      release();
      window.removeEventListener('storage', changed);
    };
  }, [bypass]);

  if (bypass) return children;
  if (pause) return <TemporaryPause onBack={() => setPause(false)} />;
  if (status === 'active') return children;
  return <main className="screen stack">
    <h1>{status === 'waiting' ? 'Use uma aba por vez' : status === 'changed' ? 'Seus dados mudaram em outra janela' : 'Não foi possível abrir seus registros'}</h1>
    <p>{status === 'waiting'
      ? 'Se o app já estiver aberto, feche a outra aba ou janela para continuar aqui. Você ainda pode fazer uma pausa.'
      : status === 'changed'
        ? 'Reabra o app para usar os dados atuais. As atividades desta janela foram encerradas para proteger seus registros.'
        : 'Tente reabrir o app em um navegador atualizado. A pausa continua disponível, sem acessar seus registros.'}</p>
    {status !== 'waiting' && <button type="button" className="btn" onClick={() => window.location.reload()}>Reabrir o app</button>}
    <button type="button" className="sos" onClick={() => setPause(true)}>Preciso de uma pausa agora</button>
  </main>;
}

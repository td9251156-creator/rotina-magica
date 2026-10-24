import { useEffect, useState, type ReactNode } from 'react';
import { DataProvider } from '@/data/provider';
import { createLocalRepositories, STORAGE_KEY } from '@/data/repositories/local';
import { WellbeingSupport } from '@/features/wellbeing/Wellbeing';

// Uma janela mantém a posse durante a sessão. A janela aberta por último assume os registros.
export const STORAGE_SESSION_LOCK = `${STORAGE_KEY}:sessao`;
// Tempo para uma janela que está recarregando ou fechando liberar a posse sozinha.
const GRACE_MS = 500;

type Status = 'waiting' | 'active' | 'taken' | 'changed' | 'unavailable';

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

const TITLES: Record<Exclude<Status, 'active'>, string> = {
  waiting: 'Abrindo seus registros…',
  taken: 'O app foi aberto em outra janela',
  changed: 'Seus dados mudaram em outra janela',
  unavailable: 'Não foi possível abrir seus registros',
};
const TEXTS: Record<Exclude<Status, 'active'>, string> = {
  waiting: 'Só um instante. Se o app estiver aberto em outra janela, ele passa a funcionar aqui.',
  taken: 'Para proteger seus registros, só uma janela usa o app por vez. Toque abaixo para continuar aqui.',
  changed: 'Reabra o app para usar os dados atuais. As atividades desta janela foram encerradas para proteger seus registros.',
  unavailable: 'Tente reabrir o app em um navegador atualizado. A pausa continua disponível, sem acessar seus registros.',
};

/**
 * Serializa sessões, inclusive entre a PWA instalada e abas da mesma origem.
 * A janela que a pessoa acabou de abrir (e está vendo) assume a posse; a anterior sai da tela
 * antes de gravar de novo. Assim um app esquecido em segundo plano nunca trava o que está à vista.
 */
export function StorageSession({ children, bypass = false, graceMs = GRACE_MS }: { children: ReactNode; bypass?: boolean; graceMs?: number }) {
  const [status, setStatus] = useState<Status>('waiting');
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (bypass) return;
    if (!navigator.locks?.request) { setStatus('unavailable'); return; }
    let disposed = false;
    let active = false;
    let release = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const changed = (event: StorageEvent) => {
      // Inclui exclusão total; versões antigas não participam da coordenação.
      if (event.key === STORAGE_KEY || event.key === null) { setStatus('changed'); release(); }
    };
    const hold = async (lock: Lock | null) => {
      if (disposed || !lock) return;
      active = true;
      const held = new Promise<void>((resolve) => { release = resolve; });
      window.addEventListener('storage', changed);
      setStatus('active');
      await held;
      window.removeEventListener('storage', changed);
    };
    const failed = (error: unknown) => {
      if (disposed) return;
      release();
      // Outra janela assumiu (steal): esta sai da tela e não grava mais nada.
      setStatus(active && error instanceof DOMException && error.name === 'AbortError' ? 'taken' : 'unavailable');
      active = false;
    };
    const steal = () => {
      if (disposed) return;
      // Uma aba em segundo plano (pré-carregada, por exemplo) não tira a posse de quem está em uso.
      if (document.visibilityState === 'hidden') { document.addEventListener('visibilitychange', steal, { once: true }); return; }
      navigator.locks.request(STORAGE_SESSION_LOCK, { steal: true }, hold).catch(failed);
    };
    navigator.locks.request(STORAGE_SESSION_LOCK, { ifAvailable: true }, async (lock) => {
      if (lock) return hold(lock);
      if (!disposed) timer = setTimeout(steal, graceMs);
    }).catch(failed);
    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', steal);
      release();
      window.removeEventListener('storage', changed);
    };
  }, [bypass, graceMs]);

  if (bypass) return children;
  if (pause) return <TemporaryPause onBack={() => setPause(false)} />;
  if (status === 'active') return children;
  return <main className="screen stack">
    <h1>{TITLES[status]}</h1>
    <p role={status === 'waiting' ? 'status' : undefined}>{TEXTS[status]}</p>
    {status === 'taken' && <button type="button" className="btn" onClick={() => window.location.reload()}>Usar aqui</button>}
    {(status === 'changed' || status === 'unavailable') && <button type="button" className="btn" onClick={() => window.location.reload()}>Reabrir o app</button>}
    <button type="button" className="sos" onClick={() => setPause(true)}>Preciso de uma pausa agora</button>
  </main>;
}

import { useState } from 'react';
import { useData } from '@/data/provider';
import { clearLocalData } from '@/data/repositories/local';
import { verifyPin } from '@/platform/crypto';
import { navigate } from '@/router';

/** Tela de PIN. O SOS fica sempre a um toque, sem PIN: crise não espera senha. */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { repos } = useData();
  const general = repos.settings.get('supportFocus', 'general') === 'general';
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [eraseError, setEraseError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let ok = false;
    try {
      ok = await verifyPin(pin, repos.settings.get('pinSalt', ''), repos.settings.get('pinHash', ''));
    } catch {
      // Sem HTTPS o navegador não oferece a conferência segura do PIN.
      setBusy(false);
      setError('Não foi possível conferir o PIN neste endereço. Abra o app pelo link com https://.');
      return;
    }
    setBusy(false);
    if (ok) onUnlock();
    else {
      setPin('');
      setError('PIN diferente. Tente de novo.');
    }
  };

  const eraseAll = () => {
    if (!window.confirm('Apagar todos os dados deste celular? Depois você pode restaurar um backup.')) return;
    try {
      clearLocalData(window.localStorage);
      window.location.reload();
    } catch {
      setEraseError(true);
    }
  };

  return (
    <main className="lock">
      <h1>Rotina Mágica</h1>
      <form className="stack" onSubmit={submit}>
        <label htmlFor="pin">Digite seu PIN</label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        />
        {error && <p className="warn small">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={pin.length < 4 || busy}>
          Entrar
        </button>
      </form>
      <button type="button" className="sos" onClick={() => navigate('sos')}>
        {general ? 'Preciso de uma pausa agora' : 'Preciso de ajuda agora'}
      </button>
      {!forgot ? (
        <button type="button" className="btn btn--ghost small" onClick={() => setForgot(true)}>
          Esqueci o PIN
        </button>
      ) : (
        <div className="card small">
          <p>
            O PIN não fica guardado em lugar nenhum, só um código feito a partir dele. Sem ele, o jeito é apagar os dados
            deste celular e restaurar um backup (o backup não traz o PIN de volta).
          </p>
          <button type="button" className="btn btn--ghost" onClick={eraseAll}>
            Apagar dados e recomeçar
          </button>
          {eraseError && <p role="alert">Não foi possível apagar os dados neste navegador. Tente liberar o armazenamento ou use as configurações do navegador.</p>}
        </div>
      )}
    </main>
  );
}

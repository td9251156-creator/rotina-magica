import { useEffect, useState } from 'react';
import { useData } from '@/data/provider';
import { findPreset, SAFETY_NOTE } from '@/domain/binaural';
import { canPlayBinaural, startBinaural, stopBinaural } from '@/platform/binaural';
import { navigate } from '@/router';
import { Screen } from '@/ui/Screen';
import { TrainingSession } from '../training/Training';
import './sleep.css';

/** Ajustes do ambiente com base na higiene do sono; só uma lista para marcar, nada é guardado. */
export const ROOM_STEPS = [
  'Luz baixa ou apagada',
  'Celular no silencioso',
  'Um copo de água por perto',
  'Quarto mais fresco, se der',
] as const;

type Stage = 'quarto' | 'relaxar' | 'som';

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Rotina para dormir: preparar o quarto, soltar o corpo (vivência `preparar_sono`) e deixar um som
 * que some sozinho. Cada etapa pode ser pulada; nada é obrigatório para merecer descanso.
 */
export function Sleep({ onBack }: { onBack: () => void }) {
  const { repos } = useData();
  const [stage, setStage] = useState<Stage>('quarto');
  const [checked, setChecked] = useState<readonly string[]>([]);
  const [until, setUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const preset = findPreset('sono')!;

  useEffect(() => {
    if (until === null) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [until]);
  useEffect(() => { if (until !== null && now >= until) setUntil(null); }, [now, until]);
  useEffect(() => () => stopBinaural(), []);

  if (stage === 'relaxar')
    return <TrainingSession id="preparar_sono" onBack={() => setStage('quarto')} onMore={() => setStage('som')} onDone={() => setStage('som')} finishLabel="Seguir para o som" />;

  if (stage === 'som') {
    const playing = until !== null;
    const play = () => {
      startBinaural(preset, preset.minutes, repos.settings.get('binauralRain', true));
      setNow(Date.now());
      setUntil(Date.now() + preset.minutes * 60_000);
    };
    const stop = () => { stopBinaural(); setUntil(null); };
    return (
      <Screen title="Boa noite" onBack={() => { stop(); onBack(); }} className="sleep">
        <p className="muted">Se quiser, deixe um som baixinho. Ele desce devagar e some sozinho em {preset.minutes} minutos.</p>
        <section className={`card sleep__sound${playing ? ' sleep__sound--on' : ''}`}>
          <h2>{preset.title}</h2>
          <p className="small">{preset.when}</p>
          {canPlayBinaural()
            ? <button type="button" className={playing ? 'btn btn--ghost' : 'btn'} aria-pressed={playing} onClick={playing ? stop : play}>{playing ? `Parar · faltam ${fmt(until - now)}` : `Tocar ${preset.minutes} min`}</button>
            : <p className="muted small">Este navegador não toca som gerado na hora. Tente no Chrome.</p>}
        </section>
        <p className="small muted">Pode bloquear a tela e deixar o celular longe da cabeça. {SAFETY_NOTE}</p>
        {!playing && <button type="button" className="btn btn--ghost" onClick={() => navigate('home')}>Prefiro silêncio. Boa noite.</button>}
      </Screen>
    );
  }

  const toggle = (step: string) => setChecked((c) => (c.includes(step) ? c.filter((s) => s !== step) : [...c, step]));
  return (
    <Screen title="Rotina para dormir" onBack={onBack} className="sleep">
      <p className="muted">Três passos curtos para desacelerar. Pule o que não servir; não é preciso fazer tudo para merecer descanso.</p>
      <section className="card" aria-labelledby="sono-quarto">
        <p className="eyebrow">Passo 1 de 3</p>
        <h2 id="sono-quarto">Preparar o quarto</h2>
        <div className="chips" role="group" aria-label="Ajustes do quarto">
          {ROOM_STEPS.map((step) => <button key={step} type="button" className={`chip${checked.includes(step) ? ' chip--on' : ''}`} aria-pressed={checked.includes(step)} onClick={() => toggle(step)}>{step}</button>)}
        </div>
      </section>
      <section className="card">
        <p className="eyebrow">Passo 2 de 3 · cerca de 3 min</p>
        <h2>Soltar o corpo</h2>
        <p className="small muted">Atenção às pernas, às costas e ao rosto, e um lugar para deixar as preocupações de amanhã.</p>
      </section>
      <section className="card">
        <p className="eyebrow">Passo 3 de 3</p>
        <h2>Um som que some sozinho</h2>
        <p className="small muted">Opcional, com fone de ouvido.</p>
      </section>
      <div className="actions">
        <button type="button" className="btn btn--ghost" onClick={() => setStage('som')}>Ir direto ao som</button>
        <button type="button" className="btn" onClick={() => setStage('relaxar')}>Começar</button>
      </div>
    </Screen>
  );
}

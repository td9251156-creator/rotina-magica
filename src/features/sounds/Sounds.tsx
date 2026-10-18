import { useEffect, useState } from 'react';
import { useData } from '@/data/provider';
import { BINAURAL_PRESETS, SAFETY_NOTE, type BinauralId } from '@/domain/binaural';
import { canPlayBinaural, startBinaural, stopBinaural } from '@/platform/binaural';
import { Screen } from '@/ui/Screen';

/** Som que toca por baixo das práticas guiadas: o acorde de sempre ou uma faixa binaural. */
export type AmbientSound = 'acorde' | Exclude<BinauralId, 'sono'>;
const BACKGROUNDS: readonly { id: AmbientSound; label: string }[] = [
  { id: 'acorde', label: 'Acorde suave' },
  { id: 'calma', label: 'Calma (alfa)' },
  { id: 'fundo', label: 'Relaxar fundo (teta)' },
];

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Sons binaurais para relaxar: três faixas, cada uma com quando usar e a base que tem. */
export function Sounds({ onBack }: { onBack: () => void }) {
  const { repos, write } = useData();
  const rain = repos.settings.get('binauralRain', true);
  const background = repos.settings.get<AmbientSound>('ambientSound', 'acorde');
  const [playing, setPlaying] = useState<{ id: BinauralId; until: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [playing]);
  useEffect(() => {
    if (playing && now >= playing.until) setPlaying(null);
  }, [now, playing]);
  useEffect(() => () => stopBinaural(), []);

  const toggle = (id: BinauralId, minutes: number) => {
    if (playing?.id === id) {
      stopBinaural();
      setPlaying(null);
      return;
    }
    startBinaural(BINAURAL_PRESETS.find((p) => p.id === id)!, minutes, rain);
    setNow(Date.now());
    setPlaying({ id, until: Date.now() + minutes * 60_000 });
  };

  return (
    <Screen title="Sons para relaxar" onBack={onBack}>
      <p className="muted">
        Sons binaurais: cada ouvido recebe um tom um pouco diferente, e o cérebro escuta uma pulsação lenta entre os dois. Feche
        os olhos e deixe o som fazer o trabalho; não precisa prestar atenção.
      </p>
      <section className="card card--kit">
        <h2>Use fone de ouvido</h2>
        <p className="small">Sem fone, os dois tons se misturam no ar e a pulsação não acontece. Volume baixo, só o bastante para ouvir.</p>
      </section>

      {!canPlayBinaural() && <p className="muted">Este navegador não toca som gerado na hora. Tente no Chrome.</p>}

      {BINAURAL_PRESETS.map((p) => {
        const on = playing?.id === p.id;
        return (
          <section key={p.id} className={`card sound${on ? ' sound--on' : ''}`}>
            <div className="sound__head">
              <h2>{p.title}</h2>
              <span className="muted small">{p.band}</span>
            </div>
            {on && <div className="sound__glow" aria-hidden="true" />}
            <p className="small">{p.when}</p>
            <p className="small muted evidence">Base: {p.evidence}</p>
            <button type="button" className={on ? 'btn btn--ghost' : 'btn'} aria-pressed={on} disabled={!canPlayBinaural()} onClick={() => toggle(p.id, p.minutes)}>
              {on ? `Parar · faltam ${fmt(playing.until - now)}` : `Tocar ${p.minutes} min`}
            </button>
          </section>
        );
      })}

      <section className="card">
        <h2>Chuva bem baixinha por baixo</h2>
        <p className="small muted">Deixa o tom mais agradável e cobre barulhos da casa.</p>
        <div className="chips">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" className={`chip${rain === v ? ' chip--on' : ''}`} aria-pressed={rain === v} onClick={() => write((r) => r.settings.set('binauralRain', v))}>
              {v ? 'Com chuva' : 'Só o tom'}
            </button>
          ))}
        </div>
        <p className="small muted">Vale a partir do próximo som que você tocar.</p>
      </section>

      <section className="card">
        <h2>Som de fundo das práticas guiadas</h2>
        <p className="small muted">Toca quando você liga "Som de fundo" numa prática. Com binaural, use fone.</p>
        <div className="chips">
          {BACKGROUNDS.map((b) => (
            <button key={b.id} type="button" className={`chip${background === b.id ? ' chip--on' : ''}`} aria-pressed={background === b.id} onClick={() => write((r) => r.settings.set('ambientSound', b.id))}>
              {b.label}
            </button>
          ))}
        </div>
      </section>

      <p className="small muted">{SAFETY_NOTE}</p>
    </Screen>
  );
}

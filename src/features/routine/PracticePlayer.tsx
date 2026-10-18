import { useEffect, useRef, useState } from 'react';
import { useData } from '@/data/provider';
import { phaseAt, practiceSeconds, phaseScript, type Practice, type PracticePhase } from '@/domain/routine';
import { canSpeak, speakLines, stopSpeaking } from '@/platform/voice';
import { canPlayAmbient, startAmbient, stopAmbient } from '@/platform/ambient';
import { startBinaural, stopBinaural } from '@/platform/binaural';
import { findPreset } from '@/domain/binaural';
import type { AmbientSound } from '../sounds/Sounds';
import { playNarratedAudio, playNarration, prefetchNarration, stopNarratedAudio } from '@/platform/narrated-audio';
import { cueFile } from '@/domain/narration';
import { vibrate } from '../games/record';
import { PhaseRing, PracticeScene } from './PracticeScene';

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

/** Prática guiada: uma instrução por vez, com tempo e uma imagem que acompanha. */
export function PracticePlayer({ practice, onDone, onStop }: { practice: Practice; onDone: () => void; onStop: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());
  const lastPhase = useRef(-1);
  const total = practiceSeconds(practice);
  const now = phaseAt(practice, elapsed);
  const { repos, write } = useData();
  // Voz desligada por padrão: a pessoa pode estar em lugar público.
  const voice = canSpeak() && repos.settings.get('practiceVoice', false);
  // Som de fundo também começa desligado, pelo mesmo motivo.
  const ambient = canPlayAmbient() && repos.settings.get('practiceAmbient', false);
  const sound = repos.settings.get<AmbientSound>('ambientSound', 'acorde');

  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - start.current) / 1000), 200);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!now) onDone();
    else if (now.index !== lastPhase.current) {
      lastPhase.current = now.index;
      vibrate(25);
      if (voice) {
        const { index, phase } = now;
        void playPhase(practice.id, index, phase).then((played) => {
          // A fase pode ter mudado enquanto o arquivo era procurado.
          if (!played && lastPhase.current === index) speakLines(phaseScript(phase));
        });
      }
    }
  }, [now, onDone, voice]);
  useEffect(
    () => () => {
      stopSpeaking();
      stopNarratedAudio();
    },
    [],
  );
  // Com a voz ligada, a narração inteira fica guardada no celular para tocar sem internet.
  useEffect(() => {
    if (voice) void prefetchNarration();
  }, [voice]);
  useEffect(() => {
    if (!ambient) return;
    const preset = findPreset(sound);
    if (!preset) {
      startAmbient();
      return stopAmbient;
    }
    // Binaural sem a chuva: a voz guia por cima e o tom fica limpo.
    startBinaural(preset, Math.ceil(total / 60) + 1, false);
    return () => stopBinaural();
  }, [ambient, sound, total]);
  const toggleVoice = () => {
    if (voice) {
      stopSpeaking();
      stopNarratedAudio();
    }
    else if (now) {
      const { index, phase, left } = now;
      void playPhase(practice.id, index, phase, phase.seconds - left).then((played) => {
        if (!played && lastPhase.current === index) speakLines(phaseScript(phase));
      });
    }
    write((r) => r.settings.set('practiceVoice', !voice));
  };
  if (!now) return null;

  const steps = practice.phases.length <= 12 ? practice.phases : null;
  return (
    <div className="player">
      <p className="muted small">{practice.title}</p>
      {steps && (
        <ol className="phases" aria-label={`Fase ${now.index + 1} de ${steps.length}`}>
          {steps.map((p, i) => (
            <li key={`${p.label}-${i}`} className={i === now.index ? 'on' : i < now.index ? 'done' : ''} />
          ))}
        </ol>
      )}
      <div className="player__visual">
        <PracticeScene practiceId={practice.id} index={now.index} phase={now.phase} progress={1 - now.left / now.phase.seconds} />
      </div>
      <p className="player__label" aria-live="polite">
        {now.phase.label}
      </p>
      <PhaseRing left={now.left} seconds={now.phase.seconds} />
      {now.phase.hint && <p className="muted center">{now.phase.hint}</p>}
      <div className="bar">
        <span style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
      </div>
      <p className="muted small center">faltam {fmt(Math.max(0, total - elapsed))}</p>
      <div className="player__sound">
        {canSpeak() && (
          <button type="button" className="player__voice" aria-pressed={voice} onClick={toggleVoice}>
            {voice ? 'Voz ligada' : 'Ouvir a voz guiando'}
          </button>
        )}
        {canPlayAmbient() && (
          <button
            type="button"
            className="player__voice"
            aria-pressed={ambient}
            onClick={() => write((r) => r.settings.set('practiceAmbient', !ambient))}
          >
            {ambient ? 'Som de fundo ligado' : 'Som de fundo'}
          </button>
        )}
      </div>
      <div className="row">
        <button type="button" className="btn btn--ghost" onClick={onStop}>
          Parar
        </button>
        <button type="button" className="btn" onClick={onDone}>
          Terminei
        </button>
      </div>
    </div>
  );
}

/** Fase com roteiro toca a narração dela; fase sem roteiro, o aviso curto (ex.: "Inspire"). */
function playPhase(practiceId: string, index: number, phase: PracticePhase, from = 0): Promise<boolean> {
  return phase.guide ? playNarratedAudio(practiceId, index, from) : playNarration(cueFile(phase), from);
}

import { useEffect, useRef, useState } from 'react';
import { useData } from '@/data/provider';
import { phaseAt, practiceSeconds, phaseSpeech, type Practice } from '@/domain/routine';
import { canSpeak, speak, stopSpeaking } from '@/platform/voice';
import { playNarratedAudio, stopNarratedAudio } from '@/platform/narrated-audio';
import { vibrate } from '../games/record';

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
        void playNarratedAudio(practice.id, now.index).then((played) => {
          if (!played) speak(phaseSpeech(now.phase));
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
  const toggleVoice = () => {
    if (voice) {
      stopSpeaking();
      stopNarratedAudio();
    }
    else if (now) speak(phaseSpeech(now.phase));
    write((r) => r.settings.set('practiceVoice', !voice));
  };
  if (!now) return null;

  const label = now.phase.label;
  const visual =
    practice.id === 'triangulo' ? (
      <svg className="tri" viewBox="0 0 100 90" aria-hidden="true">
        <path d="M50 6 94 84H6z" />
      </svg>
    ) : practice.id === 'pilar' ? (
      <div className="pillar" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i === now.index ? 'on' : i < now.index ? 'done' : ''} />
        ))}
      </div>
    ) : (
      <div className={`breath breath--${label.split(' ')[0].toLowerCase()}`} aria-hidden="true" />
    );

  return (
    <div className="player">
      <p className="muted small">{practice.title}</p>
      <div className="player__visual">{visual}</div>
      <p className="player__label" aria-live="polite">
        {label}
      </p>
      <p className="player__count">{Math.ceil(now.left)}</p>
      {now.phase.hint && <p className="muted center">{now.phase.hint}</p>}
      <div className="bar">
        <span style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
      </div>
      <p className="muted small center">faltam {fmt(Math.max(0, total - elapsed))}</p>
      {canSpeak() && (
        <button type="button" className="player__voice" aria-pressed={voice} onClick={toggleVoice}>
          {voice ? 'Voz ligada' : 'Ouvir a voz guiando'}
        </button>
      )}
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

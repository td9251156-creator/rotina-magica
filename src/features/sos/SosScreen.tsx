import { useEffect, useMemo, useState } from 'react';
import { useData } from '@/data/provider';
import type { GameId } from '@/domain/progression';
import { toLocalDate } from '@/domain/dates';
import { PRACTICES, type PracticeId } from '@/domain/routine';
import { URGE_WAVE_MS, formatRemaining } from '@/domain/urge';
import { UrgeWave } from './UrgeWave';
import type { IconId } from '@/ui/app-icons';
import { Chevron, Icon } from '@/ui/icons';
import { navigate } from '@/router';
import { PracticePlayer } from '../routine/PracticePlayer';
import { GameView } from '../games/Games';
import { recordGame, type GameOutcome } from '../games/record';
import { CRISIS_CONTACTS } from './defaults';
import { readActions, readKit } from './kit';
import { CalmSeaArt } from '@/ui/illustrations';

const SOS_BLOCKS_MS = 3 * 60 * 1000;
const CALL_SOMEONE = 'Oi! Tá podendo falar um pouquinho?';
type Stage = 'start' | 'playing' | 'practice' | 'after' | 'passou' | 'ainda_forte';

// As ferramentas: cortar, respirar, ocupar a mente com uma imagem e o espaço de respiração de 3 minutos (MBRP).
const WEAPONS: { id: PracticeId; title: string; icon: IconId }[] = [
  { id: 'quebra', title: 'Cortar o pensamento', icon: 'sos_cortar' },
  { id: 'respiracao', title: 'Respiração quadrada', icon: 'sos_respirar' },
  { id: 'triangulo', title: 'Imagem do triângulo', icon: 'sos_triangulo' },
  { id: 'sober', title: 'Parar e respirar', icon: 'ter_atencao' },
];

function Rating({ value, onPick, label }: { value: number | null; onPick: (n: number) => void; label: string }) {
  return (
    <div className="rating" role="group" aria-label={label}>
      {Array.from({ length: 11 }, (_, n) => (
        <button key={n} type="button" className={value === n ? 'on' : ''} aria-pressed={value === n} onClick={() => onPick(n)}>
          {n}
        </button>
      ))}
    </div>
  );
}

/**
 * SOS: abre na hora, sem depender de dados. O primeiro passo é jogar (3 min de Blocos baixam a
 * força da fissura) ou respirar no ritmo. Notas antes e depois mostram o que funciona para a pessoa.
 */
/** `locked`: aberto pela tela de PIN. Funciona igual, mas sem mostrar o que a pessoa escreveu. */
export function SosScreen({ onClose, onUsed, locked = false }: { onClose: () => void; onUsed: () => void; locked?: boolean }) {
  const { repos, write } = useData();
  const [openedAt] = useState(() => new Date().toISOString());
  const [waveStart] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [stage, setStage] = useState<Stage>('start');
  const [game, setGame] = useState<GameId>('blocos');
  const [weapon, setWeapon] = useState<PracticeId>('quebra');
  const [round, setRound] = useState(0);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  // Na crise, menos é mais: as 3 que mais funcionaram e o resto sob demanda.
  const [allActions, setAllActions] = useState(false);
  const letter = locked ? '' : repos.settings.get('letter', '');
  const kit = useMemo(() => (locked ? [] : readKit(repos)), [repos, locked]);
  const actions = useMemo(() => readActions(repos).filter((a) => !locked || !/^(plano|noite):/.test(a.id)), [repos, locked]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = URGE_WAVE_MS - (now - waveStart);

  const record = (outcome: 'passou' | 'ainda_forte' | 'usei', coping = chosen) => {
    write((r) =>
      r.cravings.add({
        occurredAt: openedAt,
        intensity: before,
        intensityAfter: after,
        trigger: null,
        coping: coping && !coping.startsWith('noite:') ? coping : null,
        outcome,
        note: null,
      }),
    );
  };

  const play = (g: GameId) => {
    setGame(g);
    setChosen(`jogo:${g}`);
    setRound((r) => r + 1);
    setStage('playing');
    window.scrollTo?.(0, 0);
  };

  const gameDone = (o: GameOutcome) => {
    write((r) => recordGame(r, game, { ...o, extra: { ...o.extra, sos: true } }));
    setStage('after');
  };

  const wield = (w: PracticeId) => {
    setWeapon(w);
    setChosen(`arma:${w}`);
    setStage('practice');
    window.scrollTo?.(0, 0);
  };

  const weaponDone = () => {
    if (weapon === 'quebra')
      write((r) => {
        const today = toLocalDate(new Date());
        const e = r.journal.getByDate(today);
        r.journal.upsert({ date: today, craving: e?.craving ?? null, triggers: e?.triggers ?? [], breaks: (e?.breaks ?? 0) + 1, trick: e?.trick ?? null, victory: e?.victory ?? null });
      });
    setStage('after');
  };

  if (stage === 'practice') {
    return (
      <main className="screen sos-screen">
        <PracticePlayer practice={PRACTICES[weapon]} onStop={() => setStage('after')} onDone={weaponDone} />
      </main>
    );
  }

  if (stage === 'playing') {
    return (
      <main className="screen screen--game sos-screen">
        <button type="button" className="link" onClick={() => setStage('after')}>
          Parar
        </button>
        <GameView key={round} id={game} durationMs={game === 'blocos' ? SOS_BLOCKS_MS : undefined} onFinish={gameDone} locked={locked} />
      </main>
    );
  }

  if (stage === 'passou') {
    const drop = before !== null && after !== null ? before - after : null;
    return (
      <main className="screen sos-screen">
        <CalmSeaArt />
        <h1>Você atravessou a onda.</h1>
        {drop !== null && drop > 0 && (
          <p className="big">
            A vontade foi de {before} para {after}.
          </p>
        )}
        <p>Isso conta. O app anotou o que funcionou para te mostrar primeiro da próxima vez.</p>
        <button type="button" className="btn" onClick={onClose}>
          Voltar ao início
        </button>
      </main>
    );
  }

  const afterBlock = stage === 'after' && (
    <section className="card card--accent">
      <h2>E agora, de 0 a 10?</h2>
      <Rating value={after} onPick={setAfter} label="Vontade depois" />
      {before !== null && after !== null && (
        <p className="big">{after < before ? `Baixou de ${before} para ${after}.` : after === before ? 'Ficou igual. Tente outra coisa.' : 'Subiu. Tudo bem: tente outra coisa da lista.'}</p>
      )}
      <div className="row">
        <button type="button" className="option" onClick={() => (chosen?.startsWith('arma:') ? wield(weapon) : play(game))}>
          Mais uma rodada
        </button>
        <button type="button" className="option" onClick={() => (record('passou'), setStage('passou'), window.scrollTo?.(0, 0))}>
          Passou
        </button>
      </div>
    </section>
  );

  return (
    <main className="screen sos-screen">
      {/* Com o app trancado não há barra de baixo: o voltar leva de novo à tela do PIN. */}
      {locked && (
        <button type="button" className="link" onClick={onClose}>
          ← Voltar
        </button>
      )}
      {stage === 'ainda_forte' ? (
        <h1>Tudo bem. A vontade às vezes vem em ondas seguidas. Tente outra coisa.</h1>
      ) : stage === 'start' ? (
        <h1>Ajuda agora</h1>
      ) : null}
      <button type="button" className="chip chip--help" onClick={() => document.getElementById('falar')?.scrollIntoView({ behavior: 'smooth' })}>
        Falar com alguém agora
      </button>
      <UrgeWave progress={(now - waveStart) / URGE_WAVE_MS} />
      <p className="muted small">
        A vontade sobe, chega no pico e passa. {remaining > 0 ? `Fique comigo ${formatRemaining(remaining)}.` : 'O pico já passou.'}
      </p>

      {afterBlock}

      {stage !== 'after' && (
        <>
          <p>De 0 a 10, quanto está a vontade agora?</p>
          <Rating value={before} onPick={setBefore} label="Vontade agora" />
        </>
      )}

      {stage === 'start' && letter && (
        <section className="letter">
          <p className="eyebrow">Uma carta sua, de um momento calmo</p>
          <p>{letter}</p>
        </section>
      )}
      <button type="button" className="sos sos--play" onClick={() => play('blocos')}>
        Jogar Blocos · 3 min
        <span>Jogar ocupa a cabeça e baixa a vontade</span>
      </button>
      <div className="row">
        <button type="button" className="option" onClick={() => play('onda')}>
          Segura a onda (respirar)
        </button>
        <button type="button" className="option" onClick={() => play('pares')}>
          Pares (prender a atenção)
        </button>
      </div>

      <h2>Ou use uma destas técnicas</h2>
      <div className="list">
        {WEAPONS.map(({ id, title, icon }) => (
          <button key={id} type="button" className="item__body item__body--solo" onClick={() => wield(id)}>
            <span className="item__icon">
              <Icon id={icon} />
            </span>
            <span className="item__text">
              <strong>{title}</strong>
              <span className="muted small">{PRACTICES[id].summary}</span>
            </span>
            <Chevron />
          </button>
        ))}
      </div>

      <button type="button" className="item__body item__body--solo" onClick={() => navigate('pensamento')}>
        <span className="item__icon">
          <Icon id="ferr_pensamento" />
        </span>
        <span className="item__text">
          <strong>Desatar o pensamento</strong>
          <span className="muted small">Se a cabeça está dizendo "só hoje", responda em 4 passos</span>
        </span>
        <Chevron />
      </button>

      {kit.length > 0 && (
        <section className="stack">
          {kit.map((k) => (
            <div key={k.label} className="card card--kit">
              <span className="muted small">{k.label}</span>
              <span>{k.text}</span>
            </div>
          ))}
        </section>
      )}

      <h2>Ou faça uma destas agora:</h2>
      <div className="stack">
        {(allActions ? actions : actions.slice(0, 3)).map((a) => (
          <button
            key={a.id}
            type="button"
            className={`option${chosen === a.id ? ' option--on' : ''}`}
            aria-pressed={chosen === a.id}
            onClick={() => setChosen(a.id)}
          >
            {a.text}
          </button>
        ))}
        {!allActions && actions.length > 3 && (
          <button type="button" className="link center" onClick={() => setAllActions(true)}>
            Mais opções ({actions.length - 3})
          </button>
        )}
      </div>

      <h2>Como está agora?</h2>
      <div className="row">
        <button type="button" className="option" onClick={() => (record('passou'), setStage('passou'), window.scrollTo?.(0, 0))}>
          Passou
        </button>
        <button
          type="button"
          className="option"
          onClick={() => {
            record('ainda_forte');
            setStage('ainda_forte');
            setChosen(null);
            window.scrollTo?.(0, 0);
          }}
        >
          Ainda forte
        </button>
        <button type="button" className="option" onClick={() => (record('usei'), onUsed())}>
          Usei
        </button>
      </div>

      <h2 id="falar">Se precisar falar com alguém</h2>
      <div className="stack">
        {/* Abre o WhatsApp para escolher o contato; a mensagem não fala do assunto. */}
        <a className="option" href={`https://wa.me/?text=${encodeURIComponent(CALL_SOMEONE)}`} target="_blank" rel="noopener noreferrer">
          Chamar alguém no WhatsApp
        </a>
        {CRISIS_CONTACTS.map((c) => (
          <a key={c.phone} className="option" href={`tel:${c.phone}`}>
            Ligar {c.phone}: {c.label}
          </a>
        ))}
      </div>
    </main>
  );
}

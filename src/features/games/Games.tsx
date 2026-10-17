import { useMemo, useState } from 'react';
import { useData } from '@/data/provider';
import type { Repositories } from '@/data/repositories/types';
import { ACTIVITIES } from '@/domain/evening';
import { GAME_IDS, GAME_INFO, bestScore, type GameId } from '@/domain/progression';
import { Screen } from '@/ui/Screen';
import { symbolsOn, OCCULT_SIGNS } from '@/domain/games/symbols';
import type { RoutineStyle } from '@/domain/routine';
import { ArcanaGame } from './ArcanaGame';
import { BlocksGame } from './BlocksGame';
import { PairsGame } from './PairsGame';
import { RebateGame } from './RebateGame';
import { recordGame, type GameOutcome, type RecordedGame } from './record';
import { SwipeGame } from './SwipeGame';
import { GAME_ICON } from './icons';
import { StoryGame } from './StoryGame';
import { WaveGame } from './WaveGame';

export const HOW_TO: Record<GameId, string> = {
  blocos:
    'Encaixe as peças para completar linhas. Toque no tabuleiro para girar, arraste para os lados, deslize para baixo para soltar e para cima para guardar a peça. Linhas seguidas rendem combo; quatro de uma vez rendem mais. A cada 10 linhas, sobe de nível e fica mais rápido.',
  arcanos:
    'As cartas estão viradas para baixo. Vire duas por vez e ache os pares do mesmo arcano. Lembrar onde cada uma está é o treino. Pares seguidos sem errar valem mais, e cada arcano achado traz uma ideia para a vida (não é adivinhação).',
  pares:
    'Toque em duas peças iguais para tirar o par. Só valem peças livres: sem nada em cima e com um lado aberto (as presas ficam mais escuras). Pares seguidos e rápidos valem mais. Travou? Use a dica ou embaralhe.',
  desvia: 'Aparece uma frase. Se ela leva ao uso, empurre para cima (▲). Se é algo que você quer, puxe para baixo (▼). Quanto mais rápido, mais pontos.',
  rebate: 'Um pensamento tenta te convencer a usar. Escolha, antes do tempo acabar, a resposta que derruba ele.',
  noite: 'Uma noite de risco, do fim do expediente até dormir. Escolha o que fazer em cada momento e veja a vontade subir ou baixar. As opções usam o seu plano.',
  onda: 'Segure o dedo no círculo enquanto puxa o ar (4 s) e segura (2 s). Solte o dedo e o ar devagar (6 s). Acertar o ritmo baixa a onda.',
};

/** Palavras da própria pessoa para os jogos: razões, atividades e planos de noite. */
export function personalWords(repos: Repositories) {
  const reasons = repos.plan.list('razao').map((i) => i.text);
  const plans = repos.plan.list('plano_noite').map((i) => i.text);
  const activities = repos.plan
    .list('atividade')
    .map((i) => (i.extra?.catalog ? ACTIVITIES.find((a) => a.id === i.text)?.label : i.text))
    .filter((t): t is string => !!t);
  const good = [...reasons, ...plans, ...activities].filter((t) => t.length <= 40);
  const answers: Record<string, string> = {};
  repos.plan.list('resposta').forEach((i) => {
    if (typeof i.extra?.thought === 'string') answers[i.extra.thought] = i.text;
  });
  const story = {
    reason: reasons[0],
    plan: plans[0],
    activity: activities[0],
    ifThen: repos.plan.list('se_entao')[0]?.text,
  };
  return { good, answers, story };
}

/** Os símbolos do ocultismo estão ligados para esta pessoa? */
export function useSymbols(repos: Repositories): boolean {
  return symbolsOn(repos.settings.get<boolean | null>('gameSymbols', null), repos.settings.get<RoutineStyle | null>('routineStyle', null));
}

export function GameView({ id, onFinish, durationMs }: { id: GameId; onFinish: (o: GameOutcome) => void; durationMs?: number }) {
  const { repos } = useData();
  const words = useMemo(() => personalWords(repos), [repos]);
  const symbols = useSymbols(repos);
  if (id === 'blocos') return <BlocksGame durationMs={durationMs} tree={symbols} onFinish={onFinish} />;
  if (id === 'pares') return <PairsGame onFinish={onFinish} signs={symbols ? OCCULT_SIGNS : undefined} />;
  if (id === 'arcanos') return <ArcanaGame onFinish={onFinish} />;
  if (id === 'desvia') return <SwipeGame personalGood={words.good} onFinish={onFinish} />;
  if (id === 'rebate') return <RebateGame personal={words.answers} onFinish={onFinish} />;
  if (id === 'noite') return <StoryGame personal={words.story} onFinish={onFinish} />;
  return <WaveGame onFinish={onFinish} />;
}

export function GamesHub({ onOpen, onBack }: { onOpen: (id: GameId) => void; onBack: () => void }) {
  const { repos, write } = useData();
  const sessions = repos.games.list();
  const symbols = useSymbols(repos);
  // O tarô só aparece para quem quer os símbolos; os outros jogos servem a todos.
  const ids = GAME_IDS.filter((g) => symbols || g !== 'arcanos');
  return (
    <Screen title="Jogos" onBack={onBack}>
      <p className="muted">Cada jogo treina uma habilidade que segura a vontade. Jogue um por dia; na hora da vontade, Blocos é o mais rápido.</p>
      <label className="toggle">
        <input type="checkbox" checked={symbols} onChange={(e) => write((r) => r.settings.set('gameSymbols', e.target.checked))} />
        <span>
          Símbolos do ocultismo
          <span className="small muted"> · planetas, signos, Árvore da Vida e tarô</span>
        </span>
      </label>
      <div className="tiles">
        {ids.map((g) => {
          const best = bestScore(sessions, g);
          const plays = sessions.filter((s) => s.gameId === g).length;
          return (
            <button key={g} type="button" className={`tile tile--${g}`} onClick={() => onOpen(g)}>
              <span className="tile__skill">
                <span className="tile__icon" aria-hidden="true">
                  {GAME_ICON[g]}
                </span>
                {GAME_INFO[g].skill}
              </span>
              <strong>{GAME_INFO[g].title}</strong>
              <span className="small">{GAME_INFO[g].pitch}</span>
              <span className="small muted">{plays ? `recorde ${best} · ${plays}×` : 'nunca jogado'}</span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

export function GameResult({ id, score, result, onAgain, onBack }: { id: GameId; score: number; result: RecordedGame; onAgain: () => void; onBack: () => void }) {
  return (
    <div className="result">
      <p className="muted small">{GAME_INFO[id].title}</p>
      <p className="result__score">{score}</p>
      <p>{result.record ? 'Novo recorde!' : 'pontos'}</p>
      <p className="xp">+{result.xp} XP</p>
      {result.levelUp && (
        <p className="levelup">
          Subiu para o nível {result.level.level}: {result.level.name}
        </p>
      )}
      <div className="xpbar" aria-label={`Nível ${result.level.level}`}>
        <span style={{ width: `${Math.round(result.level.progress * 100)}%` }} />
      </div>
      <p className="small muted">
        Nível {result.level.level} · {result.level.name} · faltam {result.level.needed - result.level.into} XP
      </p>
      <div className="actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Sair
        </button>
        <button type="button" className="btn" onClick={onAgain}>
          Jogar de novo
        </button>
      </div>
    </div>
  );
}

export function PlayGame({ id, onBack }: { id: GameId; onBack: () => void }) {
  const { write } = useData();
  const [stage, setStage] = useState<'intro' | 'play' | 'result'>('intro');
  const [round, setRound] = useState(0);
  const [outcome, setOutcome] = useState<{
    score: number;
    result: RecordedGame;
  } | null>(null);

  const finish = (o: GameOutcome) => {
    const result = write((r) => recordGame(r, id, o));
    setOutcome({ score: o.score, result });
    setStage('result');
  };

  return (
    <Screen onBack={onBack} className="screen--game">
      {stage === 'intro' && (
        <section className="intro">
          <span className="tile__skill">{GAME_INFO[id].skill}</span>
          <h1>{GAME_INFO[id].title}</h1>
          <p>{HOW_TO[id]}</p>
          <button type="button" className="btn" onClick={() => setStage('play')}>
            Começar
          </button>
        </section>
      )}
      {stage === 'play' && <GameView key={round} id={id} onFinish={finish} />}
      {stage === 'result' && outcome && (
        <GameResult
          id={id}
          score={outcome.score}
          result={outcome.result}
          onBack={onBack}
          onAgain={() => {
            setRound((r) => r + 1);
            setStage('play');
          }}
        />
      )}
    </Screen>
  );
}

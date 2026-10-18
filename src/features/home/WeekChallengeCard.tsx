import { useData } from '@/data/provider';
import { challengeFor, challengeProgress, nextChallenge, weekDays, weekStart, type ChosenChallenge } from '@/domain/challenges';
import { toLocalDate } from '@/domain/dates';
import { navigate } from '@/router';

/** Desafio da semana: uma meta de prática, contada sozinha com o que a pessoa já faz no app. */
export function WeekChallengeCard() {
  const { repos, write } = useData();
  const today = toLocalDate(new Date());
  const days = weekDays(today);
  const inWeek = (d: string) => d >= days[0] && d <= days[6];
  const challenge = challengeFor(today, repos.settings.get<ChosenChallenge | null>('weekChallenge', null));
  const { count, done } = challengeProgress(challenge, {
    routine: days.map((d) => repos.routine.doneOn(d)),
    games: repos.games.list().filter((g) => inWeek(g.date)),
    practices: repos.practices.list().filter((p) => inWeek(p.date)),
    thoughts: repos.thoughts.list().filter((t) => inWeek(t.date)).length,
    journalDays: repos.journal.listBetween(days[0], days[6]).length,
  });
  const swap = () => write((r) => r.settings.set<ChosenChallenge>('weekChallenge', { week: weekStart(today), id: nextChallenge(challenge).id }));

  return (
    <section className={`card challenge${done ? ' challenge--done' : ''}`} aria-label="Desafio da semana">
      <p className="eyebrow">Desafio da semana</p>
      <h2>{challenge.title}</h2>
      <p>{challenge.task}</p>
      <div className="challenge__progress">
        <span className="bar" aria-hidden="true">
          <span style={{ width: `${(count / challenge.goal) * 100}%` }} />
        </span>
        <strong>
          {count} de {challenge.goal}
        </strong>
      </div>
      {done ? (
        <p className="small">Cumprido. Isso é prática de verdade, e fica com você.</p>
      ) : (
        <p className="small muted">{challenge.why}</p>
      )}
      <div className="row">
        {!done && (
          <button type="button" className="btn" onClick={() => navigate(challenge.start.route, challenge.start.param)}>
            {challenge.start.label}
          </button>
        )}
        {!done && count === 0 && (
          <button type="button" className="btn btn--ghost" onClick={swap}>
            Trocar desafio
          </button>
        )}
      </div>
    </section>
  );
}

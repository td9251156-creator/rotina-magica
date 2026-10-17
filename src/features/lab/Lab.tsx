import { useData } from '@/data/provider';
import { addDays, toLocalDate } from '@/domain/dates';
import { alcoholLink, lastDays, moneyKept, planStats, riskiestWeekday, type NightRecord } from '@/domain/lab';
import { computeProgress } from '@/domain/progress';
import { GAME_INFO, type GameId } from '@/domain/progression';
import { averageDrops, scoreStrategies } from '@/domain/strategies';
import { Screen } from '@/ui/Screen';
import { DEFAULT_ACTIONS } from '../sos/defaults';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** O que funcionou para você, com seus próprios dados. Sem placar, sem julgamento. */
export function Lab({ onBack }: { onBack: () => void }) {
  const { repos } = useData();
  const today = toLocalDate(new Date());
  const start = repos.settings.get('trackingStartDate', today);
  const useDates = repos.useEvents.useDatesBetween(addDays(start, -1), today);
  const progress = computeProgress({ startDate: start, today, useDates });
  const plans = repos.plan.list('plano_noite');
  const personal = repos.plan.list('se_entao');

  const nights: NightRecord[] = lastDays(today, 90, start).map((date) => {
    const checkin = repos.checkins.getByDate(date);
    const choice = repos.evenings.getForDate(date);
    const used = useDates.includes(date) ? true : checkin?.used === false || choice?.outcome === 'sem_uso' ? false : null;
    return { date, planItemId: choice?.planItemId ?? null, used, alcohol: checkin?.alcohol ?? null };
  });
  const stats = planStats(nights);
  const weekday = riskiestWeekday(useDates);
  const alcohol = alcoholLink(nights);
  const money = moneyKept(repos.settings.get<number | null>('weeklySpending', null), progress.cleanDays);
  const cravings = repos.cravings.listBetween(start, today);
  const crossed = cravings.filter((c) => c.outcome === 'passou').length;
  const names = new Map<string, string>([
    ...DEFAULT_ACTIONS.map((a) => [a.id, a.text] as const),
    ...personal.map((p) => [`plano:${p.id}`, p.text] as const),
  ]);
  const strategies = scoreStrategies([...names.keys()], cravings)
    .filter((s) => s.tries > 0)
    .sort((a, b) => b.worked - a.worked || a.tries - b.tries)
    .slice(0, 3);
  const lapseTags = personal
    .flatMap((p) => (Array.isArray(p.extra?.before) ? (p.extra.before as string[]) : []))
    .reduce<Record<string, number>>((acc, t) => ({ ...acc, [t]: (acc[t] ?? 0) + 1 }), {});
  const topTags = Object.entries(lapseTags).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const gameNames = Object.fromEntries(Object.entries(GAME_INFO).map(([id, g]) => [`jogo:${id as GameId}`, g.title]));
  const drops = averageDrops(cravings).filter((d) => d.averageDrop > 0).slice(0, 4);
  const empty = !drops.length && !stats.length && !crossed && !weekday && !alcohol;

  return (
    <Screen title="Seu laboratório" onBack={onBack}>
      <p className="muted">Cada noite é um experimento. Aqui aparece o que funciona para você, com os seus dados.</p>

      <section className="grid">
        <div className="stat">
          <strong>{progress.cleanDays}</strong>
          <span>dias sem usar desde {start.split('-').reverse().slice(0, 2).join('/')}</span>
        </div>
        <div className="stat">
          <strong>{progress.currentStreak}</strong>
          <span>dias seguidos agora</span>
        </div>
        <div className="stat">
          <strong>{progress.bestStreak}</strong>
          <span>maior sequência</span>
        </div>
        <div className="stat">
          <strong>{crossed}</strong>
          <span>vontades atravessadas</span>
        </div>
      </section>
      <p className="small muted">Usar um dia não apaga nada daqui. Os dias sem usar continuam seus.</p>
      {money !== null && <p className="card">Ficaram com você cerca de {BRL.format(money)} que iriam para a droga.</p>}

      {drops.length > 0 && (
        <section>
          <h2>O que baixa a sua vontade</h2>
          <div className="stack">
            {drops.map((d) => (
              <div key={d.coping} className="card">
                <strong>{gameNames[d.coping] ?? names.get(d.coping) ?? 'Outra ação'}</strong>
                <span className="muted small">
                  baixa em média {String(d.averageDrop).replace('.', ',')} pontos ({d.times} {d.times === 1 ? 'vez' : 'vezes'})
                </span>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, d.averageDrop * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section>
          <h2>Planos de noite</h2>
          <div className="stack">
            {stats.map((s) => (
              <div key={s.planItemId} className="card">
                <strong>{plans.find((p) => p.id === s.planItemId)?.text ?? 'Plano antigo'}</strong>
                <span className="muted small">
                  {s.clean} de {s.nights} {s.nights === 1 ? 'noite' : 'noites'} sem usar
                </span>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${Math.round((s.clean / s.nights) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {strategies.length > 0 && (
        <section>
          <h2>O que mais funcionou no SOS</h2>
          <ul className="ticks">
            {strategies.map((s) => (
              <li key={s.id}>
                {names.get(s.id)} <span className="muted small">({s.worked} de {s.tries})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(weekday || alcohol || topTags.length > 0) && <h2>Padrões</h2>}
      {weekday && <p className="card">Os usos se concentram na {weekday}. Vale escolher um plano forte para esse dia logo cedo.</p>}
      {alcohol && (
        <p className="card">
          Nas noites com álcool, você usou em {alcohol.withAlcohol.used} de {alcohol.withAlcohol.nights}. Sem álcool, em{' '}
          {alcohol.withoutAlcohol.used} de {alcohol.withoutAlcohol.nights}.
          {alcohol.withAlcohol.used / alcohol.withAlcohol.nights > alcohol.withoutAlcohol.used / alcohol.withoutAlcohol.nights
            ? ' Beber abre a porta. (E álcool com cocaína forma uma substância mais tóxica para o coração.)'
            : ''}
        </p>
      )}
      {topTags.length > 0 && <p className="card">O que mais veio antes de usar: {topTags.map(([t]) => t.toLowerCase()).join(', ')}.</p>}

      {empty && (
        <p className="card muted">
          Ainda não há dados suficientes. Escolha o plano da noite e, no dia seguinte, conte como foi: em poucos dias aparece
          o que funciona para você.
        </p>
      )}
    </Screen>
  );
}

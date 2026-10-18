import { useState } from 'react';
import { useData } from '@/data/provider';
import { addDays, toLocalDate } from '@/domain/dates';
import { TRIGGERS } from '@/domain/routine';
import { TRAPS, trapCounts } from '@/domain/thinking';
import { navigate } from '@/router';

/** Diário: fissura, gatilhos, quebras e como a pessoa venceu. Clínico e sem culpa. */
export function Journal() {
  const { repos, write } = useData();
  const today = toLocalDate(new Date());
  const saved = repos.journal.getByDate(today);
  const [craving, setCraving] = useState<number | null>(saved?.craving ?? null);
  const [triggers, setTriggers] = useState<string[]>(saved?.triggers ?? []);
  const [breaks, setBreaks] = useState(saved?.breaks ?? 0);
  const [trick, setTrick] = useState(saved?.trick ?? '');
  const [victory, setVictory] = useState(saved?.victory ?? '');
  const [ok, setOk] = useState(false);
  const from = addDays(today, -13);
  const past = new Map(repos.journal.listBetween(from, today).map((e) => [e.date, e]));
  const days = Array.from({ length: 14 }, (_, i) => addDays(from, i));

  const thoughts = repos.thoughts.list();
  const topTraps = trapCounts(thoughts).slice(0, 3);
  const toggle = (t: string) => setTriggers((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  const save = () => {
    write((r) => {
      r.journal.upsert({ date: today, craving, triggers, breaks, trick: trick.trim() || null, victory: victory.trim() || null });
      r.routine.toggle(today, 'n_diario', true);
    });
    setOk(true);
  };

  return (
    <main className="screen screen--tabs">
      <header className="hero">
        <h1>Diário</h1>
        <p className="muted">Dois minutos por noite. O diário não julga: ele mostra o seu padrão, e o padrão mostra o caminho.</p>
      </header>

      <section className="card">
        <h2>Quanta vontade você sentiu hoje? (0 a 10)</h2>
        <div className="rating" role="group" aria-label="Fissura hoje">
          {Array.from({ length: 11 }, (_, n) => (
            <button key={n} type="button" className={craving === n ? 'on' : ''} aria-pressed={craving === n} onClick={() => setCraving(n)}>
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>O que despertou a vontade?</h2>
        <div className="chips">
          {TRIGGERS.map((t) => (
            <button key={t} type="button" className={`chip${triggers.includes(t) ? ' chip--on' : ''}`} aria-pressed={triggers.includes(t)} onClick={() => toggle(t)}>
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Vezes que você cortou o piloto automático</h2>
        <p className="muted small">Elástico leve, água gelada, respiração: cada vez conta.</p>
        <div className="stepper">
          <button type="button" aria-label="Menos uma" onClick={() => setBreaks((b) => Math.max(0, b - 1))}>
            −
          </button>
          <strong aria-live="polite">{breaks}</strong>
          <button type="button" aria-label="Mais uma" onClick={() => setBreaks((b) => b + 1)}>
            +
          </button>
        </div>
      </section>

      <label className="field">
        Como sua mente tentou te enganar hoje?
        <textarea rows={3} value={trick} onChange={(e) => setTrick(e.target.value)} placeholder="Ex.: “só hoje, mereço depois dessa semana”" />
      </label>
      <label className="field">
        Como você venceu?
        <textarea rows={3} value={victory} onChange={(e) => setVictory(e.target.value)} placeholder="Ex.: respirei, fui para o banho, chamei um amigo" />
      </label>

      <button type="button" className="btn" onClick={save}>
        {saved ? 'Atualizar o diário' : 'Guardar no diário'}
      </button>
      {ok && <p className="center">Guardado. Mais um dia observado com clareza.</p>}

      <section className="card">
        <h2>Últimos 14 dias</h2>
        {days.every((d) => past.get(d)?.craving == null) && (
          <div className="empty-state">
            <svg viewBox="0 0 120 80" aria-hidden="true">
              <circle className="empty-state__moon" cx="96" cy="18" r="9" />
              <rect className="empty-state__page" x="22" y="22" width="56" height="48" rx="6" />
              <path className="empty-state__lines" d="M32 36h36M32 46h28M32 56h20" />
            </svg>
            <p className="muted small">Seu primeiro registro aparece aqui. Uma noite anotada já começa a mostrar o seu padrão.</p>
          </div>
        )}
        <div className="bars" aria-label="Fissura nos últimos 14 dias">
          {days.map((d) => {
            const v = past.get(d)?.craving;
            return <span key={d} title={`${d}: ${v ?? 'sem registro'}`} style={{ height: `${v == null ? 4 : 8 + v * 9}%` }} className={v == null ? 'empty' : ''} />;
          })}
        </div>
        <p className="muted small">A altura é a fissura do dia. Dias sem registro ficam rentes ao chão.</p>
        <button type="button" className="link" onClick={() => navigate('lab')}>
          Ver o laboratório: o que funcionou com você →
        </button>
      </section>

      <section className="card">
        <h2>Pensamentos desatados</h2>
        <p className="muted small">Quando a cabeça insiste, escreva o pensamento e responda a ele. Com o tempo, a resposta vira hábito.</p>
        <button type="button" className="btn" onClick={() => navigate('pensamento')}>
          Desatar um pensamento
        </button>
        {topTraps.length > 0 && (
          <>
            <p className="eyebrow">Suas armadilhas mais comuns</p>
            <ul className="plain">
              {topTraps.map(({ trap, count }) => (
                <li key={trap.id}>
                  <strong>{trap.name}</strong> <span className="muted small">· {count}x</span>
                  <br />
                  <span className="small">{trap.question}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {thoughts.slice(0, 3).map((t) => (
          <div key={t.id} className="thought-entry">
            <span className="muted small">{t.date.split('-').reverse().slice(0, 2).join('/')}</span>
            {t.thought && <span className="quote">{t.thought}</span>}
            {t.answer && <span>→ {t.answer}</span>}
            {!t.thought && t.traps.length > 0 && <span>{t.traps.map((id) => TRAPS.find((x) => x.id === id)?.name).join(', ')}</span>}
          </div>
        ))}
      </section>

      <button type="button" className="link center" onClick={() => navigate('usei')}>
        Registrar que usei (sem julgamento)
      </button>
    </main>
  );
}

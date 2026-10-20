import { useMemo, useState } from 'react';
import { useData } from '@/data/provider';
import { ACTIVITIES, REASONS, buildEveningPlans, parseTime } from '@/domain/evening';
import { navigate } from '@/router';
import { Chip } from '@/ui/Chip';
import { completeOnboarding } from './complete-onboarding';
import { supportFocus, type SupportFocus } from '@/domain/support';

const TIMES = ['16:00', '17:00', '18:00', '19:00', '20:00'];
const STEPS = 4;

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { repos, write } = useData();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState<SupportFocus>(() => supportFocus(repos));
  const general = focus === 'general';
  const [time, setTime] = useState(() => repos.settings.get('workEndTime', '18:00'));
  const [customTime, setCustomTime] = useState('');
  const [activityIds, setActivityIds] = useState<string[]>(() =>
    repos.plan.list('atividade').filter((i) => i.extra?.catalog).map((i) => i.text),
  );
  const [customActivity, setCustomActivity] = useState('');
  const [customActivities, setCustomActivities] = useState<string[]>(() =>
    repos.plan.list('atividade').filter((i) => !i.extra?.catalog).map((i) => i.text),
  );
  const [reasons, setReasons] = useState<string[]>(() => repos.plan.list('razao').map((i) => i.text));
  const [customReason, setCustomReason] = useState('');
  const plans = useMemo(() => general && !activityIds.length && !customActivities.length ? [] : buildEveningPlans(activityIds, customActivities), [activityIds, customActivities, general]);

  const parsedCustom = customTime ? parseTime(customTime) : null;
  const finalTime = customTime ? parsedCustom : time;

  const finish = () => {
    write((r) =>
      completeOnboarding(r, { supportFocus: focus, workEndTime: finalTime ?? '18:00', activityIds, customActivities, reasons, plans }),
    );
    onDone();
  };

  const startWithoutSetup = () => {
    write((r) => {
      r.settings.set('supportFocus', focus);
      r.settings.set('onboardingDone', true);
    });
    onDone();
  };

  const addCustom = (value: string, list: string[], set: (v: string[]) => void, clear: () => void) => {
    const v = value.trim();
    if (v && !list.includes(v)) set([...list, v]);
    clear();
  };

  return (
    <main className="screen">
      <div className="top">
        <p className="muted small">
          {step + 1} de {STEPS}
        </p>
        {/* Quem abre o app pela primeira vez em crise não pode cair num questionário. */}
        <button type="button" className="link" onClick={() => navigate('sos')}>
          {general ? 'Preciso de uma pausa agora' : 'Bateu vontade? Ajuda agora'}
        </button>
      </div>

      {step === 0 && (
        <section>
          <img className="welcome-illustration" src={`${import.meta.env.BASE_URL}illustrations/welcome.webp`} width="960" height="420" alt="Um novo começo, com um caminho iluminado" />
          <p className="eyebrow">Rotina Mágica</p>
          <h1>{general ? 'Um cuidado para os dias difíceis.' : 'Que horas você costuma sair do trabalho?'}</h1>
          <p className="muted">{general ? 'Você não precisa estar bem para começar. Escolha um horário para sua pausa; lembretes são opcionais.' : 'É a hora em que o app vai te ajudar a decidir a noite.'}</p>
          <p className="small">{general ? 'Em que horário uma pausa costuma caber no seu dia?' : 'Seu horário de saída'}</p>
          <div className="chips">
            {(general ? ['08:00', '12:00', '16:00', '18:00', '20:00'] : TIMES).map((t) => (
              <Chip key={t} selected={!customTime && time === t} onClick={() => (setTime(t), setCustomTime(''))}>
                {t}
              </Chip>
            ))}
          </div>
          <label className="field">
            Outro horário
            <input inputMode="numeric" placeholder="ex.: 18:30" value={customTime} onChange={(e) => setCustomTime(e.target.value)} />
          </label>
          {customTime && !parsedCustom && <p className="warn small">Não entendi esse horário. Tente 18:30.</p>}
          <details className="wellbeing-emergency"><summary>Quero apoio específico para hábitos ou uso de substâncias</summary><div className="support-choice"><button type="button" aria-pressed={focus === 'general'} onClick={() => { setFocus('general'); write((r) => r.settings.set<SupportFocus>('supportFocus', 'general')); }}><strong>Dias difíceis e bem-estar</strong></button><button type="button" aria-pressed={focus === 'recovery'} onClick={() => { setFocus('recovery'); write((r) => r.settings.set<SupportFocus>('supportFocus', 'recovery')); }}><strong>Hábitos e uso de substâncias</strong></button></div></details>
        </section>
      )}

      {step === 1 && (
        <section>
          <h1>O que você curte fazer, ou curtia?</h1>
          <p className="muted">{general ? 'Escolha o que costuma fazer bem, ou o que gostaria de retomar. Você pode deixar em branco.' : 'Escolha quantas quiser. Daqui saem seus planos de noite.'}</p>
          <div className="chips">
            {ACTIVITIES.map((a) => (
              <Chip key={a.id} selected={activityIds.includes(a.id)} onClick={() => setActivityIds(toggle(activityIds, a.id))}>
                {a.label}
              </Chip>
            ))}
            {customActivities.map((c) => (
              <Chip key={c} selected onClick={() => setCustomActivities(toggle(customActivities, c))}>
                {c}
              </Chip>
            ))}
          </div>
          <form
            className="inline"
            onSubmit={(e) => {
              e.preventDefault();
              addCustom(customActivity, customActivities, setCustomActivities, () => setCustomActivity(''));
            }}
          >
            <input placeholder="Outra coisa" value={customActivity} onChange={(e) => setCustomActivity(e.target.value)} />
            <button type="submit" className="btn btn--ghost">
              Adicionar
            </button>
          </form>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1>{general ? 'O que você gostaria de cuidar?' : 'Por que você quer parar?'}</h1>
          <p className="muted">{general ? 'Pode ser algo importante para você. Não precisa ter um objetivo pronto; só você vê suas respostas.' : 'Isso aparece quando a vontade bater. Só você vê.'}</p>
          <div className="chips">
            {[...REASONS, ...reasons.filter((r) => !REASONS.includes(r))].map((r) => (
              <Chip key={r} selected={reasons.includes(r)} onClick={() => setReasons(toggle(reasons, r))}>
                {r}
              </Chip>
            ))}
          </div>
          <form
            className="inline"
            onSubmit={(e) => {
              e.preventDefault();
              addCustom(customReason, reasons, setReasons, () => setCustomReason(''));
            }}
          >
            <input placeholder="Com suas palavras" value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
            <button type="submit" className="btn btn--ghost">
              Adicionar
            </button>
          </form>
        </section>
      )}

      {step === 3 && (
        <section>
          <h1>{general ? 'Pequenos cuidados possíveis' : 'Seus planos de noite'}</h1>
          <p className="muted">
            {general ? 'Estas são ideias a partir do que você escolheu. Não são tarefas obrigatórias. Você também terá vivências curtas para acalmar, acolher e buscar apoio.' : 'Todo dia, na saída do trabalho, você escolhe um. Os que tiram de casa vêm primeiro, porque chegar sozinho é o momento mais difícil.'}
          </p>
          <ol className="plans">
            {plans.map((p) => (
              <li key={p.title} className="card">
                <strong>{p.title}</strong>
                <span className="muted small">{p.firstStep}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="actions">
        {step > 0 && (
          <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
            Voltar
          </button>
        )}
        {step < STEPS - 1 ? (
          <button type="button" className="btn" disabled={step === 0 && !finalTime} onClick={() => setStep(step + 1)}>
            Continuar
          </button>
        ) : (
          <button type="button" className="btn" onClick={finish}>
            Começar
          </button>
        )}
      </div>
      {general && step === 0 && <button type="button" className="link onboarding-skip" onClick={startWithoutSetup}>Começar agora sem configurar</button>}
    </main>
  );
}

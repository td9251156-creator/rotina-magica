import { useRef, useState } from 'react';
import { useData } from '@/data/provider';
import { makeBackup, restoreBackup } from '@/data/backup';
import type { PlanItemKind } from '@/data/repositories/types';
import { buildDailyReminderIcs } from '@/domain/calendar';
import { toLocalDate } from '@/domain/dates';
import { parseTime } from '@/domain/evening';
import { DEFAULT_OATH, type RoutineStyle } from '@/domain/routine';
import { hashPin, isValidPin, randomBytes, toBase64 } from '@/platform/crypto';
import { useInstall } from '@/platform/install';
import { Screen } from '@/ui/Screen';
import { Setting } from '@/ui/Setting';
import { download } from '@/ui/download';
import { supportFocus, type SupportFocus } from '@/domain/support';

const KIT_KINDS: { kind: PlanItemKind; label: string; generalLabel?: string }[] = [
  { kind: 'se_entao', label: 'Se… então…' },
  { kind: 'resposta', label: 'Respostas a pensamentos' },
  { kind: 'recusa', label: 'Recusar oferta', generalLabel: 'Colocar um limite' },
  { kind: 'filme', label: 'O filme até o fim' },
  { kind: 'futuro', label: 'Futuro' },
  { kind: 'barreira', label: 'Barreiras' },
  { kind: 'razao', label: 'Razões' },
  { kind: 'pessoa', label: 'Quem você pode chamar' },
  { kind: 'sinal_alerta', label: 'Escolhas que deixam você mais perto', generalLabel: 'Sinais de que preciso de cuidado' },
  { kind: 'gentileza', label: 'Frases para um dia difícil' },
];

export function Settings({ onEditPlans }: { onBack?: () => void; onEditPlans: () => void }) {
  const { repos, storage, write } = useData();
  const [time, setTime] = useState(() => repos.settings.get('workEndTime', '18:00'));
  const [morningTime, setMorningTime] = useState(() => repos.settings.get('dailyReminders', '08:00'));
  const [middayTime, setMiddayTime] = useState(() => repos.settings.get('middayReminder', '12:00'));
  const [spend, setSpend] = useState(() => String(repos.settings.get<number | null>('weeklySpending', null) ?? ''));
  const [msg, setMsg] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const parsed = parseTime(time);
  const appUrl = window.location.href.split('#')[0];

  const saveTime = () => {
    if (!parsed) return;
    write((r) => r.settings.set('workEndTime', parsed));
    setTime(parsed);
    setMsg(`Horário salvo: ${parsed}. Se já tinha lembrete na agenda, apague o antigo e adicione de novo.`);
  };

  const addReminder = () => {
    download('rumo-lembrete.ics', buildDailyReminderIcs({ time: parsed ?? '18:00', url: appUrl, now: new Date() }), 'text/calendar');
    write((r) => r.settings.set('reminderAddedAt', new Date().toISOString()));
    setMsg('Abra o arquivo baixado e escolha sua agenda (Google Agenda). O alarme vai tocar de segunda a sexta.');
  };

  const addMorningReminder = () => {
    const parsedMorning = parseTime(morningTime);
    if (!parsedMorning) return;
    download(
      'rotina-lembrete-manha.ics',
      buildDailyReminderIcs({ time: parsedMorning, url: appUrl, now: new Date(), title: 'Rotina: começar o dia' }),
      'text/calendar',
    );
    write((r) => r.settings.set('dailyReminders', parsedMorning));
    setMorningTime(parsedMorning);
    setMsg('Lembrete da manhã baixado. Importe na sua agenda apenas se quiser mais um horário.');
  };

  const addMiddayReminder = () => {
    const parsedMidday = parseTime(middayTime);
    if (!parsedMidday) return;
    // O link abre direto o passo do meio-dia da rotina.
    download(
      'rotina-lembrete-meio-dia.ics',
      buildDailyReminderIcs({ time: parsedMidday, url: `${appUrl}${focus === 'general' ? '#diario' : '#rotina/t_ahathoor'}`, now: new Date(), title: focus === 'general' ? 'Rotina: pausa para você' : 'Rotina: pausa do meio-dia' }),
      'text/calendar',
    );
    write((r) => r.settings.set('middayReminder', parsedMidday));
    setMiddayTime(parsedMidday);
    setMsg('Lembrete do meio-dia baixado. Abra o arquivo para salvar na agenda.');
  };

  const backup = async () => {
    try {
      const file = await makeBackup(storage, new Date(), password);
      download(`rumo-backup-${toLocalDate(new Date())}-com-senha.json`, file, 'application/json');
      write((r) => r.settings.set('lastBackupAt', new Date().toISOString()));
      setMsg('Backup com senha baixado. Sem a senha ninguém abre, nem você: anote num lugar seguro.');
    } catch (error) {
      setMsg((error as Error).message);
    }
  };

  const restore = async (f: File) => {
    try {
      if (storage.failed) throw new Error('O armazenamento está indisponível. Não é seguro restaurar agora.');
      await restoreBackup(storage, await f.text(), password || undefined);
      if (storage.failed) throw new Error('O navegador não confirmou a gravação do backup. Não feche o app antes de baixar uma cópia dos dados.');
      window.location.reload();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const hasPin = !!repos.settings.get<string | null>('pinHash', null);
  const { canInstall, install } = useInstall();
  const savePin = async () => {
    if (!isValidPin(pin) || pin !== pin2) return;
    const salt = randomBytes(16);
    const hash = await hashPin(pin, salt);
    write((r) => {
      r.settings.set('pinSalt', toBase64(salt));
      r.settings.set('pinHash', hash);
    });
    setPin('');
    setPin2('');
    setMsg('PIN ativado. Vai ser pedido ao abrir o app e depois de 2 minutos fora dele.');
  };
  const removePin = () => {
    write((r) => {
      r.settings.set('pinHash', null);
      r.settings.set('pinSalt', null);
    });
    setMsg('PIN desativado.');
  };

  const lastBackup = repos.settings.get<string | null>('lastBackupAt', null);
  const focus = supportFocus(repos);

  return (
    <Screen title="Ajustes" className="screen--tabs">
      {msg && (
        <p className="card card--accent" role="status">
          {msg}
        </p>
      )}

      <p className="eyebrow group">Seu jeito de receber apoio</p>
      <Setting title="Como o app pode me apoiar" hint={focus === 'general' ? 'Dias difíceis e bem-estar' : 'Hábitos e uso de substâncias'}>
        <p className="small muted">Você pode mudar esta escolha sem apagar registros. Indicadores antigos conservam seu significado.</p>
        <div className="support-choice">
          {([['general', 'Dias difíceis e bem-estar', 'Cuidados para ansiedade, tristeza, solidão e sobrecarga.'], ['recovery', 'Hábitos e uso de substâncias', 'Ferramentas específicas, registros de uso e planos de prevenção.']] as const).map(([value, title, detail]) => <button key={value} type="button" aria-pressed={focus === value} onClick={() => write((r) => r.settings.set<SupportFocus>('supportFocus', value))}><strong>{title}</strong><span>{detail}</span></button>)}
        </div>
      </Setting>
      <p className="eyebrow group">Sua rotina</p>
      {focus !== 'general' && <><StyleCard /><OathCard /></>}
      <LetterCard />

      <p className="eyebrow group">Aparência e lembrete</p>
      <ThemeCard />
      {canInstall && (
        <Setting title="Instalar na tela inicial" hint="Abre mais rápido e funciona sem internet">
          <p className="small muted">O app vai para a tela inicial como qualquer outro, e o atalho de ajuda aparece ao segurar o ícone.</p>
          <button type="button" className="btn" onClick={install}>
            Instalar
          </button>
        </Setting>
      )}

      <Setting title={focus === 'general' ? 'Lembrete de cuidado' : 'Lembrete na saída do trabalho'} hint="Um evento discreto na agenda do celular">
        <p className="small muted">
          O app é um site instalado e não consegue tocar alarme sozinho. A agenda do celular consegue: adicionamos um evento discreto
          com o link do app.
        </p>
        <label className="field">
          {focus === 'general' ? 'Horário da sua pausa' : 'Horário que você sai'}
          <input inputMode="numeric" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        {!parsed && <p className="warn small">Não entendi esse horário. Tente 18:30.</p>}
        <div className="row">
          <button type="button" className="btn btn--ghost" disabled={!parsed} onClick={saveTime}>
            Salvar horário
          </button>
          <button type="button" className="btn" disabled={!parsed} onClick={addReminder}>
            Adicionar na agenda
          </button>
        </div>
      </Setting>
      <Setting title="Lembrete da manhã (opcional)" hint="Um segundo horário, se ajudar sua rotina">
        <p className="small muted">Você pode importar este lembrete além do da saída. Nada é criado sem você abrir o arquivo e confirmar na agenda.</p>
        <label className="field">
          Horário da manhã
          <input inputMode="numeric" value={morningTime} onChange={(e) => setMorningTime(e.target.value)} />
        </label>
        {!parseTime(morningTime) && <p className="warn small">Não entendi esse horário. Tente 08:00.</p>}
        <button type="button" className="btn" disabled={!parseTime(morningTime)} onClick={addMorningReminder}>
          Adicionar lembrete da manhã
        </button>
      </Setting>
      <Setting title="Lembrete do meio-dia (opcional)" hint="Uma pausa curta no meio do dia">
        <p className="small muted">{focus === 'general' ? 'Um lembrete opcional para fazer uma pausa e registrar como você está. O alarme abre seu diário.' : 'Um minuto para respirar e lembrar do plano da noite antes da tarde acabar. O alarme abre direto a pausa do meio-dia.'}</p>
        <label className="field">
          Horário do meio-dia
          <input inputMode="numeric" value={middayTime} onChange={(e) => setMiddayTime(e.target.value)} />
        </label>
        {!parseTime(middayTime) && <p className="warn small">Não entendi esse horário. Tente 12:00.</p>}
        <button type="button" className="btn" disabled={!parseTime(middayTime)} onClick={addMiddayReminder}>
          Adicionar lembrete do meio-dia
        </button>
      </Setting>

      <p className="eyebrow group">Seus dados e privacidade</p>
      {focus === 'recovery' && <Setting title="Gasto médio por semana (opcional)" hint="Para o laboratório mostrar quanto ficou com você">
        <p className="small muted">Só para mostrar no laboratório quanto dinheiro ficou com você. Fica só no celular.</p>
        <div className="inline">
          <input inputMode="numeric" placeholder="R$" value={spend} onChange={(e) => setSpend(e.target.value.replace(/\D/g, ''))} />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              write((r) => r.settings.set('weeklySpending', spend ? Number(spend) : null));
              setMsg('Salvo.');
            }}
          >
            Salvar
          </button>
        </div>
      </Setting>}

      <Setting title="Seus dados" hint={lastBackup ? `Último backup: ${new Date(lastBackup).toLocaleDateString('pt-BR')}` : 'Faça um backup com senha'}>
        <p className="small muted">
          Tudo fica só neste celular, sem conta e sem nuvem. Se o navegador for limpo, os dados somem: faça backup de vez em
          quando.{lastBackup ? ` Último backup: ${new Date(lastBackup).toLocaleDateString('pt-BR')}.` : ''}
        </p>
        <label className="small" htmlFor="backup-pass">
          Senha do backup (obrigatória para baixar; pelo menos 8 caracteres)
        </label>
        <input id="backup-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="row">
          <button type="button" className="btn" onClick={backup} disabled={password.trim().length < 8}>
            Baixar backup
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => file.current?.click()}>
            Restaurar
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])}
        />
      </Setting>

      <Setting title="Bloqueio com PIN" hint={hasPin ? 'Ativado' : 'Desligado'}>
        <p className="small muted">
          {hasPin
            ? 'Ativo. O PIN bloqueia a tela do app neste navegador; o botão de ajuda abre sem mostrar o que você escreveu.'
            : 'O PIN bloqueia a tela do app neste navegador, mas não cifra o armazenamento do aparelho. O botão de ajuda continua acessível.'}
        </p>
        {hasPin ? (
          <button type="button" className="btn btn--ghost" onClick={removePin}>
            Desativar PIN
          </button>
        ) : (
          <>
            <label className="small" htmlFor="pin-new">
              Novo PIN (4 a 8 números)
            </label>
            <input id="pin-new" type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            <label className="small" htmlFor="pin-again">
              Repita o PIN
            </label>
            <input id="pin-again" type="password" inputMode="numeric" maxLength={8} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} />
            <button type="button" className="btn" disabled={!isValidPin(pin) || pin !== pin2} onClick={savePin}>
              Ativar PIN
            </button>
          </>
        )}
      </Setting>

      <p className="eyebrow group">Ajuda agora</p>
      <Setting title="Seu kit" hint="O que aparece na Ajuda agora">
        <p className="small muted">{focus === 'general' ? 'Suas frases e escolhas pessoais para momentos difíceis. Elas ficam neste celular.' : 'O que aparece na Ajuda agora. Vem das vivências e do primeiro uso.'}</p>
        {KIT_KINDS.map(({ kind, label, generalLabel }) => {
          const items = repos.plan.list(kind);
          if (!items.length) return null;
          return (
            <div key={kind}>
              <h3>{focus === 'general' ? generalLabel ?? label : label}</h3>
              <ul className="stack">
                {items.map((i) => (
                  <li key={i.id} className="kit-item">
                    <span>
                      {typeof i.extra?.thought === 'string' && <span className="muted small">"{i.extra.thought}" → </span>}
                      {i.text}
                    </span>
                    <button
                      type="button"
                      className={`link small${confirmRemove === i.id ? ' warn' : ''}`}
                      aria-label={confirmRemove === i.id ? `Confirmar remoção de ${i.text}` : `Remover ${i.text}`}
                      onClick={() => {
                        // Dois toques: o kit é escrito com calma e não pode sumir com um toque sem querer.
                        if (confirmRemove !== i.id) return setConfirmRemove(i.id);
                        write((r) => r.plan.remove(i.id));
                        setConfirmRemove(null);
                      }}
                    >
                      {confirmRemove === i.id ? 'Confirmar' : 'Remover'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <button type="button" className="link" onClick={onEditPlans}>
          {focus === 'general' ? 'Refazer suas escolhas de apoio' : 'Refazer primeiro uso (atividades, razões e planos de noite)'}
        </button>
      </Setting>

      {focus === 'recovery' && <p className="small muted center">Se precisar conversar: CVV 188, 24h, de graça.</p>}
    </Screen>
  );
}

/** O compromisso é da pessoa: o texto padrão é só um ponto de partida. */
function OathCard() {
  const { repos, write } = useData();
  const [text, setText] = useState(() => repos.settings.get('oath', DEFAULT_OATH));
  const [ok, setOk] = useState(false);
  return (
    <Setting title="Meu compromisso" hint="Lido toda manhã, com as suas palavras">
      <p className="small muted">Lido toda manhã no espelho. Escreva com as suas palavras: o que você quer para a sua vida e por quê.</p>
      <textarea rows={6} value={text} aria-label="Texto do compromisso" onChange={(e) => (setText(e.target.value), setOk(false))} />
      <div className="row">
        <button type="button" className="btn" onClick={() => (write((r) => r.settings.set('oath', text.trim() || DEFAULT_OATH)), setOk(true))}>
          Guardar compromisso
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setText(DEFAULT_OATH)}>
          Texto padrão
        </button>
      </div>
      {ok && <p className="small">Guardado.</p>}
    </Setting>
  );
}

function Choice<T extends string>({ value, options, onPick, label }: { value: T; options: { id: T; title: string; text: string }[]; onPick: (v: T) => void; label: string }) {
  return (
    <div className="stack" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={`trap${value === o.id ? ' trap--on' : ''}`} onClick={() => onPick(o.id)}>
          <strong>{o.title}</strong>
          <span className="muted small">{o.text}</span>
        </button>
      ))}
    </div>
  );
}

/** Com ou sem ritual: os passos e o histórico são os mesmos, muda o que cada passo pede. */
function StyleCard() {
  const { repos, write } = useData();
  const style = repos.settings.get<RoutineStyle>('routineStyle', 'magica');
  return (
    <Setting title="Estilo da rotina" hint={style === 'magica' ? 'Com ritual' : 'Sem ritual'}>
      <Choice
        label="Estilo da rotina"
        value={style}
        onPick={(v) => write((r) => r.settings.set('routineStyle', v))}
        options={[
          { id: 'magica', title: 'Rotina mágica', text: 'Saudações ao Sol, ritual do pentagrama e Pilar do Meio, explicados em palavras simples.' },
          { id: 'simples', title: 'Rotina simples', text: 'Os mesmos horários sem ritual: luz da manhã, intenção do dia, relaxamento guiado.' },
        ]}
      />
    </Setting>
  );
}

/** O eu calmo escreve para o eu com vontade: a carta abre primeiro na Ajuda agora. */
function LetterCard() {
  const { repos, write } = useData();
  const [text, setText] = useState(() => repos.settings.get('letter', ''));
  const [ok, setOk] = useState(false);
  return (
    <Setting title="Carta para o momento difícil" hint={text.trim() ? 'Escrita. Aparece na pausa agora' : 'Ainda não escrita'}>
      <p className="small muted">
        Escreva agora, com calma, para você mesmo num momento difícil. Ela aparece em Pausa agora (e fica escondida se o app estiver
        trancado com PIN).
      </p>
      <textarea
        rows={5}
        value={text}
        aria-label="Carta para o momento difícil"
        placeholder="Ex.: Ei, eu sei que está pesado. Lembra de como você acorda depois? Respira, toma um banho, a vontade passa."
        onChange={(e) => (setText(e.target.value), setOk(false))}
      />
      <button type="button" className="btn" onClick={() => (write((r) => r.settings.set('letter', text.trim())), setOk(true))}>
        Guardar carta
      </button>
      {ok && <p className="small">Guardada. Ela vai estar lá quando você precisar.</p>}
    </Setting>
  );
}

function ThemeCard() {
  const { repos, write } = useData();
  const theme = repos.settings.get<'auto' | 'claro' | 'noite'>('theme', 'auto');
  return (
    <Setting title="Aparência" hint={{ auto: 'Automático, segue o celular', claro: 'Claro', noite: 'Noite' }[theme]}>
      <div className="seg" role="radiogroup" aria-label="Aparência">
        {(
          [
            ['auto', 'Automático'],
            ['claro', 'Claro'],
            ['noite', 'Noite'],
          ] as const
        ).map(([id, title]) => (
          <button key={id} type="button" role="radio" aria-checked={theme === id} className={theme === id ? 'on' : ''} onClick={() => write((r) => r.settings.set('theme', id))}>
            {title}
          </button>
        ))}
      </div>
      <p className="small muted">Automático segue o celular. As práticas guiadas ficam sempre noturnas.</p>
    </Setting>
  );
}

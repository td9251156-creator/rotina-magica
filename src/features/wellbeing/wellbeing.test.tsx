import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { DataProvider } from '@/data/provider';
import { createTestRepositories } from '@/data/test-repos';
import { toLocalDate } from '@/domain/dates';
import { TrainingSession } from '../training/Training';

function setup(hash: string, locked = false, seed?: (repos: ReturnType<typeof createTestRepositories>) => void) {
  const repos = createTestRepositories();
  repos.settings.set('onboardingDone', true);
  repos.settings.set('supportFocus', 'general');
  seed?.(repos);
  if (locked) repos.settings.set('pinHash', 'hash-de-teste');
  window.location.hash = hash;
  render(<DataProvider repos={repos}><App /></DataProvider>);
  return { repos, user: userEvent.setup() };
}

describe('vivências e acolhimento geral', () => {
  it('check-in de um toque guarda o humor e oferece um cuidado que combina', async () => {
    const { repos, user } = setup('');
    await user.click(screen.getByRole('button', { name: 'Difícil' }));
    const today = toLocalDate(new Date());
    expect(repos.checkins.getByDate(today)?.mood).toBe(2);
    expect(screen.getByRole('status')).toHaveTextContent('Dias difíceis pedem menos');
    await user.click(screen.getByRole('button', { name: /Ser gentil comigo agora · \d+ min/ }));
    expect(window.location.hash).toBe('#treino/acolher_momento');
  });

  it('o check-in preserva a nota e o peso já escritos no diário', async () => {
    const today = toLocalDate(new Date());
    const { repos, user } = setup('', false, (r) => r.checkins.upsertForDate({ date: today, mood: 1, stress: 7, note: 'Nota fictícia', craving: null, used: null, alcohol: null, sleepQuality: null }));
    expect(screen.getByRole('button', { name: 'Muito difícil' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Muito bem' }));
    expect(repos.checkins.getByDate(today)).toMatchObject({ mood: 5, stress: 7, note: 'Nota fictícia' });
  });

  it('sua semana marca os dias com cuidado, sem sequência', () => {
    const today = toLocalDate(new Date());
    setup('', false, (r) => r.practices.add('pausa_corpo', today));
    const week = screen.getByRole('region', { name: 'Sua semana' });
    expect(within(week).getAllByRole('listitem')).toHaveLength(7);
    expect(within(week).getByText('1 dia com cuidado')).toBeInTheDocument();
  });

  it('um link antigo para registrar uso no foco geral abre a tela inicial', () => {
    setup('#usei');
    expect(screen.queryByRole('heading', { name: 'Registrar que usou' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Como está sendo para você?' })).toBeInTheDocument();
  });

  it('um link direto para A noite no foco geral abre a lista de jogos, sem o ensaio de recaída', () => {
    setup('#jogos/noite');
    expect(screen.getByRole('heading', { name: 'Jogos' })).toBeInTheDocument();
    expect(screen.queryByText(/cerveja/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /A noite/ })).not.toBeInTheDocument();
  });

  it('mostra a nova proposta sem exigir registro de uso', async () => {
    const { user } = setup('');
    expect(screen.queryByRole('button', { name: 'Usei' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pausa agora' }));
    expect(await screen.findByRole('heading', { name: 'Vamos cuidar deste momento.' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(/188|CAPS|SAMU|192/)).not.toBeInTheDocument();
  });

  it('filtra vivências, preserva a resposta ao voltar e pede cuidado antes de descartar', async () => {
    const { repos, user } = setup('#treino');
    await user.click(screen.getByRole('button', { name: 'Cabeça cheia' }));
    expect(screen.queryByRole('heading', { name: 'Acalmar o corpo' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Uma coisa de cada vez/ }));
    await user.click(screen.getByRole('button', { name: 'Uma tarefa' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByRole('textbox'), 'Fazer uma pausa e beber água.');
    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('textbox')).toHaveValue('Fazer uma pausa e beber água.');
    await user.click(screen.getByRole('button', { name: 'Sair da vivência' }));
    expect(screen.getByRole('alertdialog', { name: 'Sair por agora?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar aqui' }));
    expect(screen.getByRole('textbox')).toHaveValue('Fazer uma pausa e beber água.');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByRole('textbox'), 'Esta reflexão é temporária.');
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.plan.list('se_entao').map((p) => p.text)).toEqual(['Fazer uma pausa e beber água.']);
    expect(repos.practices.list().map((p) => p.techniqueId)).toEqual(['proximo_passo']);
    expect(JSON.stringify(repos.plan.list())).not.toContain('Esta reflexão é temporária.');
  });

  it('registra a revisão geral no diário de bem-estar, sem alterar o diário antigo', async () => {
    const { repos, user } = setup('#treino/revisao_gentil');
    const today = toLocalDate(new Date());
    repos.journal.upsert({ date: today, craving: 8, triggers: [], breaks: 0, trick: null, victory: 'Registro antigo' });
    await user.type(screen.getByRole('textbox'), 'Hoje consegui pedir companhia.');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.checkins.getByDate(today)?.note).toBe('Hoje consegui pedir companhia.');
    expect(repos.journal.getByDate(today)).toMatchObject({ craving: 8, victory: 'Registro antigo' });
  });

  it('a ajuda abre com PIN e não revela frases pessoais', async () => {
    const { repos, user } = setup('#sos', true);
    repos.plan.add({ kind: 'gentileza', text: 'Frase pessoal secreta' });
    expect(screen.queryByText('Frase pessoal secreta')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Voltar para o aqui e agora/ }));
    expect(screen.getByRole('progressbar', { name: 'Progresso da vivência' })).toBeInTheDocument();
    expect(screen.queryByText('Frase pessoal secreta')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sair da vivência' }));
    await user.click(screen.getByRole('button', { name: 'Voltar para entrar com PIN' }));
    expect(screen.getByLabelText('Digite seu PIN')).toBeInTheDocument();
  });

  it('pede retorno opcional e guarda a percepção junto da vivência', async () => {
    const { repos, user } = setup('#treino/proximo_passo');
    await user.click(screen.getByRole('button', { name: 'Uma tarefa' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByRole('textbox'), 'Beber água.');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.getByRole('group', { name: 'Como esta vivência pareceu?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ajudou um pouco' }));
    expect(repos.practices.list()[0]).toMatchObject({ techniqueId: 'proximo_passo', feedback: 'helped' });
    expect(screen.getByRole('status')).toHaveTextContent('Você pode mudar essa resposta');
  });

  it('retira das recomendações uma vivência marcada como mais difícil', async () => {
    const { user } = setup('', false, (repos) => {
      const practice = repos.practices.add('pausa_corpo', toLocalDate(new Date()));
      repos.practices.setFeedback(practice.id, 'harder');
    });
    await user.click(screen.getByRole('button', { name: 'Muito difícil' }));
    expect(screen.queryByRole('button', { name: /Dar uma pausa ao corpo/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ser gentil comigo agora · \d+ min/ })).toBeInTheDocument();
  });

  it('oferece na Pausa uma alternativa sem foco na respiração', () => {
    setup('#sos');
    expect(screen.getByRole('button', { name: /Dar espaço ao que passa na cabeça.*sem foco na respiração/ })).toBeInTheDocument();
  });

  it('permite concluir uma vivência geral sem escrever nem guardar frase', async () => {
    const { repos, user } = setup('#treino/proximo_passo');
    await user.click(screen.getByRole('button', { name: 'Uma tarefa' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar sem guardar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.getByRole('heading', { name: 'Um cuidado feito.' })).toBeInTheDocument();
    expect(repos.plan.list('se_entao')).toHaveLength(0);
    expect(repos.practices.list()).toHaveLength(1);
  });

  it('deixa excluir o registro sensível do dia após confirmação', async () => {
    const today = toLocalDate(new Date());
    const { repos, user } = setup('#diario', false, (r) => {
      r.checkins.upsertForDate({ date: today, mood: 2, stress: 8, note: 'Texto privado', craving: null, sleepQuality: null, alcohol: null, used: null });
    });
    await user.click(screen.getByRole('button', { name: 'Excluir registro de hoje' }));
    expect(screen.getByRole('alertdialog', { name: 'Excluir registro de hoje?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(repos.checkins.getByDate(today)).toBeNull();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('expõe o histórico diário em texto e move o foco ao navegar', async () => {
    const today = toLocalDate(new Date());
    const { user } = setup('', false, (repos) => {
      repos.checkins.upsertForDate({ date: today, mood: 2, stress: 7, note: null, craving: null, sleepQuality: null, alcohol: null, used: null });
    });
    await user.click(screen.getByRole('button', { name: 'Diário' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Seu diário' })).toHaveFocus());
    const history = screen.getByRole('list', { name: 'Registros dos últimos 14 dias' });
    expect(within(history).getByText(new RegExp(`${today.split('-').reverse().join('/')}.*peso 7 de 10`))).toBeInTheDocument();
  });

  it('progresso geral não mistura práticas antigas do outro foco', () => {
    const { repos } = setup('#lab', false, (r) => {
      r.practices.add('se_entao', toLocalDate(new Date()));
      const practice = r.practices.add('ancorar_sentidos', toLocalDate(new Date()));
      r.practices.setFeedback(practice.id, 'helped');
    });
    expect(screen.getByText('vivências praticadas')).toBeInTheDocument();
    expect(screen.getByText('vivências praticadas').previousElementSibling).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: /Voltar para o aqui e agora.*Fazer de novo/ })).toBeInTheDocument();
    expect(repos.practices.list()).toHaveLength(2);
  });

  it('permite mudar o tipo de apoio sem apagar o kit', async () => {
    const { repos, user } = setup('#ajustes');
    repos.plan.add({ kind: 'pessoa', text: 'Minha amiga' });
    await user.click(await screen.findByText('Como o app pode me apoiar'));
    await user.click(screen.getByRole('button', { name: /Hábitos e uso de substâncias/ }));
    expect(repos.settings.get('supportFocus', '')).toBe('recovery');
    expect(repos.plan.list('pessoa')[0].text).toBe('Minha amiga');
  });

  it('deixa entrar no app sem preencher o primeiro uso nem criar planos padrão', async () => {
    const repos = createTestRepositories();
    window.location.hash = '';
    const user = userEvent.setup();
    render(<DataProvider repos={repos}><App /></DataProvider>);
    await user.click(screen.getByRole('button', { name: 'Começar agora sem configurar' }));
    expect(await screen.findByRole('heading', { name: 'Como está sendo para você?' })).toBeInTheDocument();
    expect(repos.settings.get('onboardingDone', false)).toBe(true);
    expect(repos.plan.list('plano_noite')).toHaveLength(0);
  });

  it('conclui a configuração geral em dois passos e aproveita texto ainda não adicionado', async () => {
    const repos = createTestRepositories();
    window.location.hash = '';
    const user = userEvent.setup();
    render(<DataProvider repos={repos}><App /></DataProvider>);
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Outra coisa'), 'Sentar no quintal');
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    expect(await screen.findByRole('heading', { name: 'Como está sendo para você?' })).toBeInTheDocument();
    expect(repos.plan.list('atividade').map((item) => item.text)).toContain('Sentar no quintal');
  });

  it('a barra tem cinco itens com a pausa no centro e as vivências como aba', async () => {
    const { user } = setup('');
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(nav).getAllByRole('button').map((b) => b.textContent)).toEqual(['Hoje', 'Diário', 'Pausa agora', 'Vivências', 'Ajustes']);
    expect(within(nav).getByRole('button', { name: 'Hoje' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(nav).getByRole('button', { name: 'Vivências' }));
    expect(window.location.hash).toBe('#treino');
    expect(await screen.findByRole('heading', { name: 'Do que você precisa agora?' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Navegação principal' })).getByRole('button', { name: 'Vivências' })).toHaveAttribute('aria-current', 'page');
  });

  it('num dia muito bom, o convite é guardar no diário o que fez bem', async () => {
    const { user } = setup('');
    await user.click(screen.getByRole('button', { name: 'Muito bem' }));
    await user.click(screen.getByRole('button', { name: 'Escrever no diário' }));
    expect(window.location.hash).toBe('#diario');
  });

  it('no diário, o humor usa a mesma lista do início e o peso vai de 0 a 10', async () => {
    const { repos, user } = setup('#diario');
    const mood = screen.getByRole('group', { name: 'Como está seu dia?' });
    await user.click(within(mood).getByRole('button', { name: 'Mais ou menos' }));
    const weight = screen.getByRole('group', { name: 'Peso do momento, de 0 a 10' });
    expect(within(weight).getAllByRole('button')).toHaveLength(11);
    await user.click(within(weight).getByRole('button', { name: '4' }));
    expect(within(weight).getByRole('button', { name: '4' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Guardar meu registro' }));
    expect(repos.checkins.getByDate(toLocalDate(new Date()))).toMatchObject({ mood: 3, stress: 4 });
  });

  it('no foco geral, escolher uma opção não bloqueia o passo seguinte', async () => {
    const { user } = setup('#treino/proximo_passo');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Opcional. Se escrever, fica no seu kit pessoal ao concluir.')).toBeInTheDocument();
  });

  it('sair sem ter escrito nada fecha a vivência sem perguntar', async () => {
    const { user } = setup('#treino/pausa_corpo');
    await user.click(screen.getByRole('button', { name: 'Sair da vivência' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#treino');
  });

  it('um id inválido seguido de um válido não quebra a ordem dos hooks', () => {
    const repos = createTestRepositories();
    const callbacks = { onDone: vi.fn(), onMore: vi.fn(), onBack: vi.fn() };
    const view = render(<DataProvider repos={repos}><TrainingSession id="inexistente" {...callbacks} /></DataProvider>);
    expect(screen.getByRole('heading', { name: 'Exercício não encontrado' })).toBeInTheDocument();
    view.rerender(<DataProvider repos={repos}><TrainingSession id="proximo_passo" {...callbacks} /></DataProvider>);
    expect(within(screen.getByRole('group', { name: 'Opções para este passo' })).getByRole('button', { name: 'Uma tarefa' })).toBeInTheDocument();
  });
});

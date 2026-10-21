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
  it('mostra a nova proposta sem exigir registro de uso', async () => {
    const { user } = setup('');
    expect(screen.getByRole('button', { name: 'Preciso de uma pausa agora' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Usei' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preciso de uma pausa agora' }));
    expect(await screen.findByRole('heading', { name: 'Vamos cuidar deste momento.' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(/188|CAPS|SAMU|192/)).not.toBeInTheDocument();
  });

  it('filtra vivências, preserva a resposta ao voltar e pede cuidado antes de descartar', async () => {
    const { repos, user } = setup('#treino');
    await user.click(screen.getByRole('button', { name: 'Cabeça cheia' }));
    expect(screen.queryByRole('heading', { name: 'Acalmar e se orientar' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Uma coisa de cada vez/ }));
    await user.click(screen.getByRole('button', { name: 'Uma tarefa' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByRole('textbox'), 'Fazer uma pausa e beber água.');
    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('textbox')).toHaveValue('Fazer uma pausa e beber água.');
    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    expect(screen.getByRole('alertdialog', { name: 'Sair da vivência?' })).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: '← Voltar' }));
    await user.click(screen.getByRole('button', { name: 'Voltar para entrar com PIN' }));
    expect(screen.getByRole('heading', { name: 'Rotina Mágica' })).toBeInTheDocument();
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

  it('retira das recomendações uma vivência marcada como mais difícil', () => {
    setup('', false, (repos) => {
      const practice = repos.practices.add('pausa_corpo', toLocalDate(new Date()));
      repos.practices.setFeedback(practice.id, 'harder');
    });
    expect(screen.queryByRole('button', { name: /Acalmar o corpo/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Uma coisa de cada vez/ })).toBeInTheDocument();
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
    expect(await screen.findByRole('heading', { name: 'Rotina Mágica' })).toBeInTheDocument();
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
    expect(await screen.findByRole('heading', { name: 'Rotina Mágica' })).toBeInTheDocument();
    expect(repos.plan.list('atividade').map((item) => item.text)).toContain('Sentar no quintal');
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

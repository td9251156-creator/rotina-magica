import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { DataProvider } from '@/data/provider';
import { createTestRepositories } from '@/data/test-repos';
import { toLocalDate } from '@/domain/dates';
import { TrainingSession } from '../training/Training';

function setup(hash: string, locked = false) {
  const repos = createTestRepositories();
  repos.settings.set('onboardingDone', true);
  repos.settings.set('supportFocus', 'general');
  if (locked) repos.settings.set('pinHash', 'hash-de-teste');
  window.location.hash = hash;
  render(<DataProvider repos={repos}><App /></DataProvider>);
  return { repos, user: userEvent.setup() };
}

describe('vivências e acolhimento geral', () => {
  it('mostra a nova proposta sem exigir registro de uso', async () => {
    const { user } = setup('');
    expect(screen.getByRole('button', { name: 'Preciso de apoio agora' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Usei' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preciso de apoio agora' }));
    expect(await screen.findByRole('heading', { name: 'Vamos cuidar deste momento.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /188/ })).toHaveAttribute('href', 'tel:188');
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
  });

  it('permite mudar o tipo de apoio sem apagar o kit', async () => {
    const { repos, user } = setup('#ajustes');
    repos.plan.add({ kind: 'pessoa', text: 'Minha amiga' });
    await user.click(await screen.findByText('Como o app pode me apoiar'));
    await user.click(screen.getByRole('button', { name: /Hábitos e uso de substâncias/ }));
    expect(repos.settings.get('supportFocus', '')).toBe('recovery');
    expect(repos.plan.list('pessoa')[0].text).toBe('Minha amiga');
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

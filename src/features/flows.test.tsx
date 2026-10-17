import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';
import { DataProvider } from '@/data/provider';
import { createTestRepositories } from '@/data/test-repos';
import { addDays, toLocalDate } from '@/domain/dates';

function ready() {
  const repos = createTestRepositories();
  repos.settings.set('onboardingDone', true);
  repos.settings.set('trackingStartDate', toLocalDate(new Date()));
  return repos;
}

function open(hash: string, repos = ready()) {
  window.location.hash = hash;
  render(
    <DataProvider repos={repos}>
      <App />
    </DataProvider>,
  );
  return { repos, user: userEvent.setup() };
}

describe('treino que monta o SOS', () => {
  it('o que é escrito no treino aparece no SOS', async () => {
    const { repos, user } = open('#treino/filme');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await user.type(screen.getByRole('textbox'), 'acordado às 4h, sem dinheiro');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.getByText(/já está no seu SOS/)).toBeInTheDocument();
    expect(repos.plan.list('filme').map((i) => i.text)).toEqual(['acordado às 4h, sem dinheiro']);
    expect(repos.practices.list().map((p) => p.techniqueId)).toEqual(['filme']);

    window.location.hash = '#sos';
    expect(await screen.findByText('acordado às 4h, sem dinheiro')).toBeInTheDocument();
  });

  it('resposta a pensamento guarda o pensamento escolhido', async () => {
    const { repos, user } = open('#treino/pensamentos');
    await user.click(screen.getByRole('button', { name: 'Ninguém vai saber' }));
    await user.type(screen.getByRole('textbox'), 'Eu vou saber.');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.plan.list('resposta')[0]).toMatchObject({ text: 'Eu vou saber.', extra: { thought: 'Ninguém vai saber' } });
  });
});

describe('SOS que aprende', () => {
  it('registra a ação que funcionou e passa a mostrá-la primeiro', async () => {
    const { repos, user } = open('#sos');
    await user.click(screen.getByRole('button', { name: /Mais opções/ }));
    const comer = screen.getByRole('button', { name: /Coma algo/ });
    await user.click(comer);
    await user.click(screen.getByRole('button', { name: 'Passou' }));
    expect(screen.getByText('Você atravessou a onda.')).toBeInTheDocument();
    expect(repos.cravings.listBetween('2000-01-01', '2999-12-31')[0]).toMatchObject({ coping: 'comer', outcome: 'passou' });
  });

  it('a ação mais eficaz aparece primeiro numa nova crise', async () => {
    const repos = ready();
    repos.cravings.add({ occurredAt: new Date().toISOString(), intensity: null, intensityAfter: null, trigger: null, coping: 'comer', outcome: 'passou', note: null });
    open('#sos', repos);
    const texts = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    expect(texts.findIndex((t) => /Coma algo/.test(t))).toBeLessThan(texts.findIndex((t) => /Saia de casa/.test(t)));
  });

  it('"Usei" leva ao registro sem julgamento', async () => {
    const { user } = open('#sos');
    await user.click(screen.getByRole('button', { name: 'Usei' }));
    expect(await screen.findByText('Registrar que usou')).toBeInTheDocument();
  });
});

describe('depois de usar', () => {
  it('registra, acolhe, pergunta e guarda um ajuste; o início entra em modo cuidado', async () => {
    const { repos, user } = open('#usei');
    await user.click(screen.getByRole('button', { name: 'Agora há pouco' }));
    expect(screen.getByText(/Nada do seu progresso foi apagado/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /188/ })).toHaveAttribute('href', 'tel:188');
    await user.click(screen.getByRole('button', { name: /Entender o que houve/ }));
    await user.click(screen.getByRole('button', { name: 'Bebi' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toMatch(/beber/);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(repos.plan.list('se_entao')[0].extra).toMatchObject({ fromLapse: true, before: ['Bebi'] });
    expect(repos.useEvents.lastOccurredAt()).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(await screen.findByText('Hoje é dia de cuidar de você')).toBeInTheDocument();
  });
});

describe('manhã seguinte', () => {
  afterEach(() => vi.useRealTimers());

  it('pergunta como foi a noite e alimenta o laboratório', async () => {
    // A pergunta só aparece depois das 5h: fixamos o relógio no meio do dia.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 16, 12, 0));
    const repos = ready();
    const today = toLocalDate(new Date());
    const yesterday = addDays(today, -1);
    repos.settings.set('trackingStartDate', addDays(today, -2));
    const plan = repos.plan.add({ kind: 'plano_noite', text: 'Academia', extra: { firstStep: 'Ir direto' } });
    repos.evenings.choose(yesterday, plan.id);
    const { user } = open('', repos);

    await user.click(screen.getByRole('button', { name: 'Passei sem usar' }));
    await user.click(screen.getByRole('button', { name: 'Não' }));
    expect(screen.getByText(/Mais uma noite no seu laboratório/)).toBeInTheDocument();
    expect(repos.evenings.getForDate(yesterday)?.outcome).toBe('sem_uso');
    expect(repos.checkins.getByDate(yesterday)).toMatchObject({ used: false, alcohol: false });

    await user.click(screen.getByRole('button', { name: /Seu laboratório/ }));
    expect(await screen.findByText('1 de 1 noite sem usar')).toBeInTheDocument();
  });
});

describe('jogos', () => {
  it('Rebate: escolher a resposta forte derruba o pensamento', async () => {
    const { THOUGHTS } = await import('@/domain/games/rebate');
    const { user } = open('#jogos/rebate');
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    const strong = screen.getAllByRole('button').find((b) => THOUGHTS.some((t) => t.strong === b.textContent))!;
    await user.click(strong);
    expect(screen.getByText('Derrubado!')).toBeInTheDocument();
  });

  it('Desvia: empurrar gatilho e puxar o que é bom', async () => {
    const { RISK_CUES } = await import('@/domain/games/swipe');
    const { user } = open('#jogos/desvia');
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    const card = document.querySelector('.swipe__card')!.textContent!;
    const risky = (RISK_CUES as readonly string[]).includes(card);
    await user.click(screen.getByRole('button', { name: risky ? '▲ Empurrar' : '▼ Puxar' }));
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('no SOS, nota antes e depois do jogo mostra quanto baixou e alimenta o laboratório', async () => {
    const { repos, user } = open('#sos');
    await user.click(screen.getByRole('group', { name: 'Vontade agora' }).querySelectorAll('button')[8]);
    await user.click(screen.getByRole('button', { name: /Jogar Blocos/ }));
    expect(screen.getByLabelText(/Tabuleiro/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Parar' }));
    await user.click(screen.getByRole('group', { name: 'Vontade depois' }).querySelectorAll('button')[3]);
    expect(screen.getByText('Baixou de 8 para 3.')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Passou' })[0]);
    expect(screen.getByText('A vontade foi de 8 para 3.')).toBeInTheDocument();
    expect(repos.cravings.listBetween('2000-01-01', '2999-12-31')[0]).toMatchObject({ intensity: 8, intensityAfter: 3, coping: 'jogo:blocos' });
  });

  it('a tela inicial mostra a rotina e marca um passo', async () => {
    const { repos, user } = open('');
    expect(screen.getByRole('heading', { name: 'Rotina Mágica' })).toBeInTheDocument();
    expect(screen.getByText('Meu compromisso')).toBeInTheDocument();
    expect(screen.getByText('Próximo passo', { exact: false })).toBeInTheDocument();
    // Só o período da hora vem aberto; os outros abrem com um toque.
    const noite = screen.getByRole('region', { name: 'Noite' });
    if (!within(noite).queryByRole('button', { name: 'Marcar Luz pelo corpo' })) await user.click(within(noite).getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('button', { name: 'Marcar Luz pelo corpo' }));
    expect(repos.routine.doneOn(toLocalDate(new Date()))).toEqual(['n_pilar']);
    expect(screen.getByRole('button', { name: 'Marcar Luz pelo corpo' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('o diário guarda o dia e marca o passo da noite', async () => {
    const { repos, user } = open('#diario');
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: 'Tédio' }));
    await user.click(screen.getByRole('button', { name: 'Mais uma' }));
    await user.type(screen.getByLabelText('Como você venceu?'), 'respirei');
    await user.click(screen.getByRole('button', { name: 'Guardar no diário' }));
    const today = toLocalDate(new Date());
    expect(repos.journal.getByDate(today)).toMatchObject({ craving: 6, triggers: ['Tédio'], breaks: 1, victory: 'respirei' });
    expect(repos.routine.doneOn(today)).toContain('n_diario');
  });

  it('desata um pensamento em quatro degraus e mostra no diário', async () => {
    const { repos, user } = open('#pensamento');
    await user.click(screen.getByRole('button', { name: 'Fome' }));
    expect(screen.getByText(/coma algo/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await user.click(screen.getByRole('button', { name: 'Tédio' }));
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await user.type(screen.getByLabelText(/Escreva do jeito que veio/), 'Só hoje, eu mereço');
    await user.click(screen.getByRole('button', { name: /Dar permissão/ }));
    expect(screen.getByText(/acordar bem amanhã/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await user.type(screen.getByLabelText(/a um amigo/), 'A vontade passa');
    await user.type(screen.getByLabelText(/melhor versão/), 'Tomar banho');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByText('Pensamento desatado.')).toBeInTheDocument();
    expect(repos.thoughts.list()[0]).toMatchObject({ body: ['Fome'], feelings: ['Tédio'], traps: ['permissao'], answer: 'A vontade passa', best: 'Tomar banho' });
  });

  it('a carta do eu calmo abre primeiro na ajuda agora', async () => {
    const repos = ready();
    repos.settings.set('letter', 'Respira. A vontade passa.');
    open('#sos', repos);
    expect(screen.getByText('Uma carta sua, de um momento calmo')).toBeInTheDocument();
    expect(screen.getByText('Respira. A vontade passa.')).toBeInTheDocument();
  });

  it('escolhe a rotina sem ritual e o passo muda de texto', async () => {
    const { repos, user } = open('');
    expect(screen.getByText(/Clima de hoje · aprendendo/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sem ritual' }));
    expect(repos.settings.get('routineStyle', null)).toBe('simples');
    expect(screen.queryByRole('button', { name: 'Sem ritual' })).not.toBeInTheDocument();
    const noite = screen.getByRole('region', { name: 'Noite' });
    if (!within(noite).queryByRole('button', { name: 'Marcar Relaxar o corpo' })) await user.click(within(noite).getByRole('button', { expanded: false }));
    expect(screen.getByRole('button', { name: 'Marcar Relaxar o corpo' })).toBeInTheDocument();
  });

  it('o passo guiado mostra o juramento editado', async () => {
    const repos = ready();
    repos.settings.set('oath', 'Meu templo, minha lei.');
    const { user } = open('#rotina/m_juramento', repos);
    expect(screen.getByText('Meu templo, minha lei.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Li em voz alta' }));
    expect(repos.routine.doneOn(toLocalDate(new Date()))).toContain('m_juramento');
  });
});

describe('bloqueio com PIN', () => {
  async function withPin() {
    const { hashPin, randomBytes, toBase64 } = await import('@/platform/crypto');
    const repos = ready();
    const salt = randomBytes(16);
    repos.settings.set('pinSalt', toBase64(salt));
    repos.settings.set('pinHash', await hashPin('2580', salt));
    repos.plan.add({ kind: 'razao', text: 'meu segredo' });
    return repos;
  }

  it('pede o PIN para entrar e aceita só o certo', async () => {
    const { user } = open('', await withPin());
    expect(screen.getByLabelText('Digite seu PIN')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Digite seu PIN'), '1111');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('PIN diferente. Tente de novo.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Digite seu PIN'), '2580');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Meu compromisso')).toBeInTheDocument();
  });

  it('o SOS abre sem PIN, mas não mostra o que a pessoa escreveu', async () => {
    const repos = await withPin();
    repos.settings.set('letter', 'carta secreta');
    const { user } = open('', repos);
    await user.click(screen.getByRole('button', { name: 'Preciso de ajuda agora' }));
    expect(await screen.findByText(/Jogar Blocos/)).toBeInTheDocument();
    expect(screen.queryByText(/meu segredo/)).not.toBeInTheDocument();
    expect(screen.queryByText(/carta secreta/)).not.toBeInTheDocument();
  });

  it('ativa o PIN nos ajustes sem trancar quem já está dentro', async () => {
    const { repos, user } = open('#ajustes');
    await user.type(screen.getByLabelText('Novo PIN (4 a 8 números)'), '1234');
    await user.type(screen.getByLabelText('Repita o PIN'), '1234');
    await user.click(screen.getByRole('button', { name: 'Ativar PIN' }));
    expect(await screen.findByText(/PIN ativado/)).toBeInTheDocument();
    expect(repos.settings.get<string | null>('pinHash', null)).toBeTruthy();
    expect(screen.queryByLabelText('Digite seu PIN')).not.toBeInTheDocument();
  });
});

describe('A noite (história)', () => {
  it('joga a noite até o fim e ganha XP', async () => {
    const repos = ready();
    repos.plan.add({ kind: 'razao', text: 'ver meu filho crescer' });
    const { user } = open('#jogos/noite', repos);
    await user.click(screen.getByRole('button', { name: /Começar/ }));
    for (let i = 0; i < 5; i++) {
      const options = screen.getAllByRole('button').filter((b) => b.className.includes('option'));
      await user.click(options[0]);
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
      if (screen.queryByRole('button', { name: 'Ver resultado' })) break;
    }
    await user.click(screen.getByRole('button', { name: 'Ver resultado' }));
    expect((await screen.findAllByText(/XP/)).length).toBeGreaterThan(0);
    expect(repos.games.list().map((g) => g.gameId)).toEqual(['noite']);
  });
});

describe('melhorias de crise e de dados', () => {
  it('no primeiro uso, a ajuda está a um toque', async () => {
    const repos = createTestRepositories();
    const { user } = open('', repos);
    await user.click(screen.getByRole('button', { name: 'Bateu vontade? Ajuda agora' }));
    expect(await screen.findByText(/Jogar Blocos/)).toBeInTheDocument();
  });

  it('lembra do backup depois de uma semana e respeita o "agora não"', async () => {
    const repos = ready();
    repos.settings.set('trackingStartDate', addDays(toLocalDate(new Date()), -10));
    const { user } = open('', repos);
    expect(screen.getByText('Guarde uma cópia')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Agora não' }));
    expect(screen.queryByText('Guarde uma cópia')).not.toBeInTheDocument();
  });

  it('o ensaio da noite vira plano no SOS', async () => {
    const { buildStory } = await import('@/domain/games/story');
    const { createRng } = await import('@/domain/games/rng');
    const spy = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_012_345);
    const scenes = buildStory(createRng(1_700_000_012_345 % 100000), {});
    const repos = ready();
    const { user } = open('#jogos/noite', repos);
    await user.click(screen.getByRole('button', { name: /Começar/ }));
    // Sempre a pior escolha: a noite escapa e mostra onde mais pesou.
    for (const scene of scenes) {
      if (screen.queryByRole('button', { name: 'Ver resultado' })) break;
      const worst = [...scene.choices].sort((x, y) => y.delta - x.delta)[0];
      await user.click(screen.getByRole('button', { name: worst.text }));
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
    }
    await user.click(screen.getByRole('button', { name: 'Guardar no meu SOS' }));
    expect(screen.getByText(/Vai aparecer no seu SOS/)).toBeInTheDocument();
    expect(repos.plan.list('se_entao')[0].text).toMatch(/^Se .+, então/);
    spy.mockRestore();
  });
});

describe('interface', () => {
  it('remover do kit pede um segundo toque', async () => {
    const repos = ready();
    repos.plan.add({ kind: 'razao', text: 'minha saúde' });
    const { user } = open('#ajustes', repos);
    await user.click(screen.getByRole('button', { name: 'Remover minha saúde' }));
    expect(repos.plan.list('razao')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção de minha saúde' }));
    expect(repos.plan.list('razao')).toHaveLength(0);
  });

  it('as terapias e vivências têm entrada própria na tela inicial', async () => {
    const { user } = open('');
    await user.click(screen.getByRole('button', { name: /Terapias e vivências/ }));
    expect(window.location.hash).toBe('#treino');
  });
});

describe('terapias e vivências', () => {
  it('agrupa os exercícios por terapia, com o nome de cada uma', async () => {
    const { user } = open('#treino');
    expect(screen.getByText('Encontrar seus motivos')).toBeInTheDocument();
    expect(screen.getByText(/Entrevista motivacional · 0 de 3 feitos/)).toBeInTheDocument();
    expect(screen.getByText(/Atenção plena/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /De 0 a 10/ }));
    expect(window.location.hash).toBe('#treino/regua');
  });

  it('régua de 0 a 10: a nota libera o passo e o motivo vira razão no SOS', async () => {
    const { repos, user } = open('#treino/regua');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByRole('textbox'), 'não quero perder o emprego');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText(/não fica guardado/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.plan.list('razao').map((i) => i.text)).toEqual(['não quero perder o emprego']);
    expect(screen.getByRole('button', { name: 'Mais vivências' })).toBeInTheDocument();
  });

  it('dar nome ao pensamento vira resposta para aquele pensamento', async () => {
    const { repos, user } = open('#treino/nome');
    await user.click(screen.getByRole('button', { name: 'Eu mereço depois do dia que tive' }));
    await user.type(screen.getByRole('textbox'), 'Lá vem o "eu mereço"');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Pular' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.plan.list('resposta')[0]).toMatchObject({ text: 'Lá vem o "eu mereço"', extra: { thought: 'Eu mereço depois do dia que tive' } });
  });

  it('a rede de apoio aparece no SOS', async () => {
    const { user } = open('#treino/rede');
    await user.type(screen.getByRole('textbox'), 'meu irmão');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    window.location.hash = '#sos';
    expect(await screen.findByText('Quem você pode chamar')).toBeInTheDocument();
    expect(screen.getByText('meu irmão')).toBeInTheDocument();
  });

  it('a frase gentil fica guardada para os dias difíceis', async () => {
    const { repos, user } = open('#treino/amigo');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Pular' }));
    await user.type(screen.getByRole('textbox'), 'Amanhã eu recomeço.');
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.plan.list('gentileza').map((i) => i.text)).toEqual(['Amanhã eu recomeço.']);
    expect(screen.getByText(/quando você registrar um dia difícil/)).toBeInTheDocument();
  });

  it('a prática guiada de 3 minutos toca ali mesmo e conta como prática', async () => {
    const { repos, user } = open('#treino');
    await user.click(screen.getByRole('button', { name: /Parar e respirar/ }));
    expect(screen.getByText('Pare')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Terminei' }));
    expect(repos.practices.list().map((p) => p.techniqueId)).toEqual(['sober']);
    expect(screen.getByText('Terapias e vivências')).toBeInTheDocument();
  });
});

describe('rodada 3', () => {
  it('treino de recusa entra no SOS', async () => {
    const { repos, user } = open('#treino/recusar');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: /só um pouco, pra relaxar/ }));
    await user.type(screen.getByRole('textbox'), 'Não, parei. Valeu.');
    while (!screen.queryByRole('button', { name: 'Concluir' })) await user.click(screen.getByRole('button', { name: /Continuar|Pular/ }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.plan.list('recusa').map((i) => i.text)).toEqual(['Não, parei. Valeu.']);
    window.location.hash = '#sos';
    expect(await screen.findByText('Não, parei. Valeu.')).toBeInTheDocument();
  });

  it('SOS oferece chamar alguém; o laboratório não tem mais o cartão de ajuda de gente', async () => {
    open('#sos');
    expect(screen.getByRole('link', { name: 'Chamar alguém no WhatsApp' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\?text=/);
    window.location.hash = '#lab';
    expect(await screen.findByText(/laboratório/i)).toBeInTheDocument();
    expect(screen.queryByText('Ajuda de gente')).not.toBeInTheDocument();
  });

  it('Pares: escolhe a partida e tira um par de peças livres', async () => {
    const { user } = open('#jogos/pares');
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    await user.click(screen.getByRole('button', { name: /Partida curta/ }));
    expect(document.querySelectorAll('.mj__tile')).toHaveLength(34);
    await user.click(screen.getByRole('button', { name: /Dica/ }));
    const hinted = document.querySelectorAll('.mj__tile--hint');
    expect(hinted).toHaveLength(2);
    await user.click(hinted[0] as HTMLElement);
    await user.click(hinted[1] as HTMLElement);
    expect(document.querySelectorAll('.mj__tile')).toHaveLength(32);
    await user.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(document.querySelectorAll('.mj__tile')).toHaveLength(34);
  });

  it('Blocos: guarda a peça, pausa e termina pela pausa', async () => {
    const { user } = open('#jogos/blocos');
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    const hold = screen.getByRole('button', { name: 'Guardar a peça' });
    await user.click(hold);
    expect(screen.getByRole('button', { name: /^Guardada: / })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Terminar' }));
    expect(await screen.findByText(/pontos|Novo recorde/)).toBeInTheDocument();
  });

  it('Arcanos: aparece com os símbolos, vira cartas e some quando desliga', async () => {
    const repos = ready();
    repos.settings.set('routineStyle', 'magica');
    const { user } = open('#jogos', repos);
    await user.click(screen.getByRole('button', { name: /Arcanos/ }));
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    await user.click(screen.getByRole('button', { name: /Partida curta/ }));
    const backs = screen.getAllByRole('button', { name: 'Carta virada para baixo' });
    expect(backs).toHaveLength(16);
    await user.click(backs[0]);
    expect(screen.getAllByRole('button', { name: 'Carta virada para baixo' })).toHaveLength(15);
    await user.click(screen.getByRole('button', { name: /Voltar/ }));
    await user.click(screen.getByRole('checkbox', { name: /Símbolos do ocultismo/ }));
    expect(screen.queryByRole('button', { name: /Arcanos/ })).not.toBeInTheDocument();
    expect(repos.settings.get('gameSymbols', null)).toBe(false);
  });

  it('Terapias, parte 2: a régua guarda as notas e o laboratório mostra', async () => {
    const { repos, user } = open('#treino/regua');
    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByRole('textbox'), 'quero acordar bem');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.getByText(/notas ficam no laboratório/)).toBeInTheDocument();
    expect(repos.practices.list().at(-1)).toMatchObject({ techniqueId: 'regua', scores: { importancia: 8, confianca: 5 } });
  });

  it('Terapias, parte 2: as coisas boas da revisão da noite vão para o Diário', async () => {
    const { repos, user } = open('#treino/revisao');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Opcional. Vai para o Diário de hoje.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'o café com minha irmã');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(repos.journal.getByDate(toLocalDate(new Date()))?.victory).toBe('o café com minha irmã');
  });

  it('Terapias, parte 2: Parar e respirar na Ajuda agora e o sinal no Clima de hoje', async () => {
    const repos = ready();
    repos.plan.add({ kind: 'sinal_alerta', text: 'sacar dinheiro na sexta', extra: null });
    open('#sos', repos);
    expect(screen.getByRole('button', { name: /Parar e respirar/ })).toBeInTheDocument();
    cleanupAndOpenHome(repos);
    expect(screen.getByText('Fique de olho: sacar dinheiro na sexta')).toBeInTheDocument();
  });
});

function cleanupAndOpenHome(repos: ReturnType<typeof ready>) {
  document.body.innerHTML = '';
  open('', repos);
}


describe('terapias e vivências, parte 3', () => {
  it('dia difícil deixa só o básico, vale só hoje e dá para voltar', async () => {
    const { repos, user } = open('#');
    await user.click(screen.getByRole('button', { name: /Fazer só o básico hoje/ }));
    expect(repos.settings.get('hardDay', null)).toBe(toLocalDate(new Date()));
    expect(screen.getByRole('img', { name: '0 de 4 passos hoje' })).toBeInTheDocument();
    expect(screen.getByText(/Hoje é só o básico/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Voltar à rotina completa' }));
    expect(repos.settings.get('hardDay', null)).toBeNull();
    expect(screen.queryByRole('img', { name: '0 de 4 passos hoje' })).not.toBeInTheDocument();
  });

  it('dia difícil marcado ontem não vale hoje', () => {
    const repos = ready();
    repos.settings.set('hardDay', addDays(toLocalDate(new Date()), -1));
    open('#', repos);
    expect(screen.getByRole('button', { name: /Fazer só o básico hoje/ })).toBeInTheDocument();
  });

  it('o texto para a família pode ser copiado e aparece entre as vivências', async () => {
    const { user } = open('#treino/texto_familia');
    await user.click(screen.getByRole('button', { name: 'Mandar ou copiar' }));
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toMatch(/Nar-Anon e o Amor-Exigente/);

    window.location.hash = '#treino';
    expect(await screen.findByText('Trazer a família para perto')).toBeInTheDocument();
  });
});

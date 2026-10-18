/**
 * "A noite": ensaio interativo da noite de risco (saída do trabalho, casa vazia, tédio).
 * Cada escolha mexe na vontade e explica o porquê. As opções usam o plano da própria pessoa,
 * então o ensaio é da noite dela, não de um personagem. Base: ensaio comportamental e
 * intenções de implementação da prevenção de recaída (Marlatt; Gollwitzer). Errar aqui é barato.
 */
import { shuffle, type Rng } from './rng';

export interface StoryChoice {
  text: string;
  /** Quanto a escolha mexe na vontade (negativo baixa). */
  delta: number;
  why: string;
}

export interface StoryScene {
  id: string;
  /** O "se" do plano que sai do ensaio: "Se {cue}, então…". */
  cue: string;
  time: string;
  text: string;
  choices: StoryChoice[];
  /** Cena montada com os registros da pessoa (gatilho mais comum, hora de pico, o que já funcionou). */
  fromData?: string;
}

export interface StoryPersonal {
  reason?: string;
  activity?: string;
  plan?: string;
  ifThen?: string;
  /** Gatilho mais comum no Diário (um dos TRIGGERS). */
  trigger?: string;
  /** Hora (0 a 23) em que a vontade mais aparece nos pedidos de ajuda. */
  peakHour?: number;
  /** O que mais vezes fez a vontade passar no SOS, já em palavras. */
  coping?: string;
}

export const START_URGE = 4;
export const MAX_URGE = 10;

const cut = (t: string | undefined, fallback: string) => {
  const s = (t ?? '').trim() || fallback;
  return s.length > 70 ? `${s.slice(0, 67)}…` : s;
};

type Variant = (p: StoryPersonal) => StoryScene;

/** Uma fase por momento da noite, três versões em cada (dia comum, sexta, pagamento) para o ensaio não ficar decorado. */
const PHASES: Variant[][] = [
  [
    (p) => ({
      id: 'saida-cansado',
      cue: 'eu sair do trabalho cansado',
      time: '18:10',
      text: 'Fim do expediente. Cansado, a cabeça já pensa na noite livre.',
      choices: [
        { text: 'Ir pelo caminho de sempre, que passa perto de onde comprava', delta: 2, why: 'Lugares ligados ao uso puxam a vontade sozinhos.' },
        { text: 'Mudar o caminho e passar no mercado', delta: -1, why: 'Mudar a rota tira os gatilhos do caminho.' },
        { text: `Sair já com o plano da noite: ${cut(p.plan, 'academia')}`, delta: -2, why: 'Decidir antes da vontade chegar é o que mais protege.' },
      ],
    }),
    () => ({
      id: 'saida-cerveja',
      cue: 'me chamarem para beber depois do trabalho',
      time: '18:05',
      text: 'Dia pesado. Um colega chama para uma cerveja "rapidinha".',
      choices: [
        { text: 'Topar a cerveja', delta: 3, why: 'Álcool tira o freio e costuma vir junto com a vontade.' },
        { text: 'Agradecer e ir comer algo de verdade', delta: -1, why: 'Fome e cansaço aumentam a vontade. Comer ajuda.' },
        { text: 'Ir, mas pedir refrigerante e sair em 30 minutos', delta: 0, why: 'Dá para estar junto com limite claro, mas pede atenção.' },
      ],
    }),
    () => ({
      id: 'saida-sexta',
      cue: 'chegar sexta-feira à noite',
      time: '18:00',
      text: 'Sexta-feira. A semana acabou e a cabeça pede uma "recompensa".',
      choices: [
        { text: 'Passar no lugar de sempre "só pra ver"', delta: 3, why: 'Ir "só pra ver" é decidir sem perceber que decidiu.' },
        { text: 'Marcar algo com hora: futebol, cinema, janta', delta: -2, why: 'Fim de semana sem plano é o maior risco. Com hora marcada, a noite tem dono.' },
        { text: 'Ir pra casa e ver o que acontece', delta: 1, why: 'Deixar a noite em aberto entrega a decisão para a vontade.' },
      ],
    }),
  ],
  [
    (p) => ({
      id: 'casa-silencio',
      cue: 'eu chegar em casa sem nada para fazer',
      time: '19:00',
      text: 'Em casa, sozinho. Silêncio. Nada marcado para fazer.',
      choices: [
        { text: 'Deitar e rolar o celular', delta: 1, why: 'Tédio sem plano é o terreno preferido da vontade.' },
        { text: cut(p.activity, 'Cozinhar algo de verdade'), delta: -2, why: 'Algo que ocupa mãos e cabeça corta o tédio.' },
        { text: 'Banho frio e trocar de roupa', delta: -1, why: 'Mudar o estado do corpo quebra o piloto automático.' },
      ],
    }),
    () => ({
      id: 'casa-pagamento',
      cue: 'o pagamento cair',
      time: '19:20',
      text: 'O pagamento caiu na conta. Tem dinheiro sobrando hoje.',
      choices: [
        { text: 'Deixar o dinheiro onde está', delta: 1, why: 'Dinheiro fácil de gastar é uma porta aberta.' },
        { text: 'Passar para uma conta difícil de mexer', delta: -2, why: 'Dificultar o acesso dá tempo para a vontade passar.' },
        { text: 'Pagar uma conta agora', delta: -1, why: 'Dar destino ao dinheiro tira a "sobra" que vira uso.' },
      ],
    }),
    () => ({
      id: 'casa-festa',
      cue: 'me chamarem para um lugar onde vai ter',
      time: '19:40',
      text: 'Chega convite para uma festa. Você sabe que lá vai ter.',
      choices: [
        { text: 'Ir e ver como fica', delta: 3, why: 'Lugar com oferta é o gatilho mais forte que existe.' },
        { text: 'Recusar e propor outro programa', delta: -2, why: 'Trocar o lugar, não a companhia, mantém o social sem o risco.' },
        { text: 'Ir com hora para sair e sem dinheiro', delta: 0, why: 'Diminui o risco, mas ainda pede muito de você.' },
      ],
    }),
  ],
  [
    () => ({
      id: 'fissura-corpo',
      cue: 'a vontade apertar no corpo',
      time: '21:00',
      text: 'A vontade chega forte. Corpo inquieto, boca seca.',
      choices: [
        { text: 'Ficar parado, brigando com ela', delta: 1, why: 'Brigar parado faz a vontade parecer maior do que é.' },
        { text: 'Surfar a onda: 10 minutos respirando devagar', delta: -2, why: 'A vontade sobe, chega ao pico e desce. Observar sem obedecer ensina isso ao cérebro.' },
        { text: 'Jogar Blocos por 3 minutos', delta: -2, why: 'Jogos visuais como Tetris baixam a força das imagens da vontade.' },
      ],
    }),
    () => ({
      id: 'fissura-imagem',
      cue: 'a cena do uso vier na cabeça',
      time: '21:15',
      text: 'Vem a cena na cabeça: o ritual, o primeiro efeito.',
      choices: [
        { text: 'Deixar a cena rodar', delta: 2, why: 'Imaginar o uso em detalhe alimenta a vontade.' },
        { text: 'Passar o filme até o fim: a manhã seguinte', delta: -2, why: 'Ver a noite inteira, até a manhã, tira o brilho da cena.' },
        { text: 'Ocupar a cabeça com algo visual', delta: -1, why: 'Tarefas visuais disputam espaço com as imagens da vontade.' },
      ],
    }),
    () => ({
      id: 'fissura-tedio',
      cue: 'o tédio apertar',
      time: '21:30',
      text: 'Nada na TV, nada no celular. O tédio pesa.',
      choices: [
        { text: 'Ficar no sofá rolando o celular', delta: 1, why: 'O tédio cresce quando o corpo fica parado.' },
        { text: 'Sair 10 minutos para andar, sem levar cartão', delta: -2, why: 'Mudar de lugar corta a vontade, e sem cartão não tem compra.' },
        { text: 'Mandar um áudio para alguém, sobre qualquer coisa', delta: -1, why: 'Falar com alguém quebra o isolamento, mesmo sem tocar no assunto.' },
      ],
    }),
  ],
  [
    (p) => ({
      id: 'pensamento-mereco',
      cue: 'eu pensar "só hoje, eu mereço"',
      time: '22:00',
      text: 'Um pensamento: "Só hoje. Eu mereço depois dessa semana."',
      choices: [
        { text: 'Concordar: foi uma semana difícil mesmo', delta: 3, why: 'Pensamento de permissão é o último passo antes do uso.' },
        { text: `Lembrar por que quer parar: ${cut(p.reason, 'minha saúde')}`, delta: -2, why: 'Suas razões, lembradas na hora, pesam contra a permissão.' },
        { text: 'Responder: "Eu mereço acordar bem amanhã"', delta: -1, why: 'Trocar por uma recompensa que não cobra depois.' },
      ],
    }),
    (p) => ({
      id: 'pensamento-ninguem',
      cue: 'eu pensar "ninguém vai saber"',
      time: '22:10',
      text: '"Ninguém vai saber. Uma vez não faz diferença."',
      choices: [
        { text: 'Pensar: "É verdade, ninguém vai saber"', delta: 3, why: 'O "só uma vez" esconde como as noites costumam terminar.' },
        { text: 'Responder: "Eu vou saber. E nunca foi uma vez só."', delta: -2, why: 'Lembrar o padrão real desmonta o "só uma vez".' },
        { text: `Seguir seu plano: ${cut(p.ifThen, 'se apertar, saio de casa por 15 minutos')}`, delta: -2, why: 'Um "se… então…" pronto dispensa decidir no pior momento.' },
      ],
    }),
    () => ({
      id: 'pensamento-controle',
      cue: 'eu pensar "dessa vez eu controlo"',
      time: '22:05',
      text: '"Dessa vez eu controlo. Só um pouco."',
      choices: [
        { text: 'Acreditar: dessa vez é diferente', delta: 3, why: 'O "só um pouco" quase nunca termina pouco.' },
        { text: 'Lembrar como a última vez terminou', delta: -2, why: 'A lembrança real da última noite pesa mais que a promessa.' },
        { text: 'Ir dormir mais cedo e decidir amanhã', delta: -1, why: 'Adiar a decisão para amanhã quase sempre desfaz a vontade.' },
      ],
    }),
  ],
  [
    () => ({
      id: 'final-mensagem',
      cue: 'chegar mensagem oferecendo',
      time: '22:40',
      text: 'Chega uma mensagem: "tem hoje, quer?"',
      choices: [
        { text: 'Responder "hoje não"', delta: 1, why: 'Responder deixa a conversa aberta para outro dia.' },
        { text: 'Bloquear o número e apagar a conversa', delta: -3, why: 'Cortar o acesso é uma das barreiras mais fortes que existem.' },
        { text: 'Deixar sem resposta, com a conversa aberta', delta: 2, why: 'Conversa aberta fica chamando a noite toda.' },
      ],
    }),
    () => ({
      id: 'final-sono',
      cue: 'eu ficar sem sono à noite',
      time: '23:00',
      text: 'Sem sono. A noite parece longa.',
      choices: [
        { text: 'Ficar acordado esperando o sono', delta: 1, why: 'Ficar acordado sem rumo estica a janela de risco.' },
        { text: 'Luz baixa e celular fora do quarto', delta: -2, why: 'Dormir fecha a janela de risco da noite.' },
        { text: 'Um filme leve na sala até dar sono', delta: -1, why: 'Distração tranquila ajuda a atravessar a noite.' },
      ],
    }),
    () => ({
      id: 'final-banco',
      cue: 'eu abrir o app do banco à noite',
      time: '23:10',
      text: 'Você abre o app do banco "só para ver o saldo".',
      choices: [
        { text: 'Ficar olhando o saldo', delta: 2, why: 'Olhar o dinheiro na hora da vontade é meio caminho para gastar.' },
        { text: 'Baixar o limite do PIX noturno agora', delta: -3, why: 'Dificultar o acesso dá tempo para a vontade passar.' },
        { text: 'Fechar o app e deixar o celular longe', delta: -1, why: 'Tirar o gatilho da mão já ajuda.' },
      ],
    }),
  ],
];

/**
 * Uma cena para cada gatilho do Diário. Quando a pessoa já registrou um gatilho mais de uma vez, a cena
 * da vontade (21h) passa a ser a do gatilho dela: o ensaio treina a situação de risco real (Marlatt).
 */
export const TRIGGER_SCENES: Record<string, Omit<StoryScene, 'time'>> = {
  Estresse: {
    id: 'gatilho-estresse',
    cue: 'eu chegar em casa estressado',
    text: 'Você chega em casa com a cabeça fervendo do dia. O corpo pede alívio rápido.',
    choices: [
      { text: 'Pensar "hoje eu preciso, eu mereço"', delta: 3, why: 'Estresse pede alívio rápido, e a vontade se oferece como atalho. É a armadilha da permissão.' },
      { text: 'Descarregar o corpo: 10 minutos de caminhada rápida ou flexões', delta: -2, why: 'Exercício gasta a adrenalina do estresse e baixa a vontade em minutos.' },
      { text: 'Escrever em três linhas o que pesou hoje', delta: -1, why: 'Pôr para fora tira o peso da cabeça e mostra o tamanho real do problema.' },
    ],
  },
  Tédio: {
    id: 'gatilho-tedio',
    cue: 'bater o tédio em casa',
    text: 'Nada para fazer. Sofá, celular, e o tempo não passa.',
    choices: [
      { text: 'Rolar o celular esperando algo acontecer', delta: 2, why: 'Tédio sem plano é o terreno onde a vontade cresce.' },
      { text: 'Começar algo com as mãos: cozinhar, arrumar, consertar', delta: -2, why: 'Ocupar as mãos e a atenção tira espaço da vontade.' },
      { text: 'Jogar uma partida de Blocos', delta: -1, why: 'Um jogo que prende a atenção baixa a vontade (estudos com Tetris).' },
    ],
  },
  Raiva: {
    id: 'gatilho-raiva',
    cue: 'eu ficar com raiva de alguém',
    text: 'Uma discussão deixou você com raiva. A vontade vem junto: "que se dane".',
    choices: [
      { text: 'Pensar "que se dane" e ir atrás', delta: 3, why: 'A raiva quer descarga na hora e apaga o freio. A vontade aproveita.' },
      { text: 'Sair para andar até a raiva baixar de tom', delta: -2, why: 'Mover o corpo descarrega a raiva sem custo nenhum.' },
      { text: 'Respirar devagar antes de responder qualquer coisa', delta: -1, why: 'Respirar devagar baixa a tensão e devolve a escolha para você.' },
    ],
  },
  Solidão: {
    id: 'gatilho-solidao',
    cue: 'eu me sentir sozinho',
    text: 'Casa vazia. Ninguém mandou mensagem hoje.',
    choices: [
      { text: 'Ficar sozinho com o pensamento', delta: 2, why: 'A solidão faz a vontade parecer a única companhia.' },
      { text: 'Mandar um áudio para alguém, sobre qualquer assunto', delta: -2, why: 'Contato com gente é dos melhores protetores contra recaída.' },
      { text: 'Ir para um lugar com gente: padaria, praça, mercado', delta: -1, why: 'Estar perto de gente já muda o clima da noite.' },
    ],
  },
  Cansaço: {
    id: 'gatilho-cansaco',
    cue: 'eu estiver exausto',
    text: 'Exausto. A cabeça diz que só um pouco daria energia para a noite.',
    choices: [
      { text: 'Acreditar que precisa de energia agora', delta: 2, why: 'Cansaço deixa o freio fraco, e a promessa de energia parece boa.' },
      { text: 'Comer de verdade, tomar banho e deitar cedo', delta: -2, why: 'Corpo descansado aguenta muito melhor a vontade.' },
      { text: 'Um café e ver o que dá', delta: 1, why: 'Ficar acordado no cansaço estica a janela de risco.' },
    ],
  },
  Álcool: {
    id: 'gatilho-alcool',
    cue: 'eu estiver bebendo',
    text: 'Umas cervejas depois do trabalho. A vontade cresce a cada gole.',
    choices: [
      { text: 'Pedir mais uma', delta: 3, why: 'O álcool tira o freio e chama a vontade.' },
      { text: 'Trocar por água e ir embora agora', delta: -2, why: 'Parar o álcool cedo corta a escalada da noite.' },
      { text: 'Avisar alguém que está indo para casa', delta: -1, why: 'Combinar com alguém vira um compromisso para cumprir.' },
    ],
  },
  'Dinheiro na mão': {
    id: 'gatilho-dinheiro',
    cue: 'cair dinheiro na conta',
    text: 'Caiu o pagamento. O dinheiro está ali, fácil.',
    choices: [
      { text: 'Sacar dinheiro "para garantir"', delta: 3, why: 'Dinheiro vivo na mão é acesso direto.' },
      { text: 'Guardar o dinheiro na poupança e baixar o limite do PIX da noite', delta: -2, why: 'Dificultar o acesso dá tempo para a vontade passar.' },
      { text: 'Pagar as contas da semana primeiro', delta: -1, why: 'Dinheiro com destino sobra menos para a vontade.' },
    ],
  },
  'Oferta ou mensagem': {
    id: 'gatilho-oferta',
    cue: 'chegar uma oferta',
    text: 'Chega mensagem: "tem hoje, quer?"',
    choices: [
      { text: 'Responder "depois eu vejo"', delta: 2, why: 'Deixar a porta aberta mantém a vontade acesa.' },
      { text: 'Bloquear o contato e apagar a conversa', delta: -2, why: 'Cortar o acesso é das ações que mais protegem.' },
      { text: 'Responder "não, valeu" e largar o celular', delta: -1, why: 'Recusar curto e direto funciona, sem precisar explicar.' },
    ],
  },
};

/** Cenas comuns que repetiriam o gatilho da pessoa: saem do sorteio quando a cena dela entra. */
const OVERLAP: Record<string, string> = {
  Álcool: 'saida-cerveja',
  'Dinheiro na mão': 'casa-pagamento',
  'Oferta ou mensagem': 'final-mensagem',
};

/** Fase da vontade (21h), que vira a cena do gatilho da pessoa. */
const URGE_PHASE = 2;

const pad = (n: number) => String(n).padStart(2, '0');

/** Monta uma noite: uma cena por fase, opções embaralhadas. Com registros, a vontade chega pelo gatilho da pessoa. */
export function buildStory(rng: Rng, personal: StoryPersonal = {}): StoryScene[] {
  const own = personal.trigger ? TRIGGER_SCENES[personal.trigger] : undefined;
  const skip = personal.trigger ? OVERLAP[personal.trigger] : undefined;
  return PHASES.map((variants, phase) => {
    const options = variants.map((v) => v(personal)).filter((sc) => sc.id !== skip);
    let scene: StoryScene = options[Math.floor(rng() * options.length)];
    if (phase === URGE_PHASE && (own || personal.coping)) {
      const notes: string[] = [];
      if (own) {
        // A hora de pico só entra se couber na noite do ensaio (entre 19h e 22h).
        const hour = personal.peakHour !== undefined && personal.peakHour >= 19 && personal.peakHour <= 21 ? personal.peakHour : 21;
        scene = { ...own, time: `${pad(hour)}:00`, choices: [...own.choices] };
        notes.push(`o seu gatilho mais comum (${personal.trigger!.toLowerCase()})`);
      }
      if (personal.coping) {
        // O que já funcionou com a pessoa entra no lugar da opção do meio.
        const middle = [...scene.choices].sort((a, b) => a.delta - b.delta)[1];
        const coping = { text: `Fazer o que já funcionou com você: ${cut(personal.coping, '')}`, delta: -3, why: 'Seus registros mostram que isso já fez a vontade passar antes.' };
        scene = { ...scene, choices: scene.choices.map((c) => (c === middle ? coping : c)) };
        notes.push('o que já funcionou com você');
      }
      scene = { ...scene, fromData: `Cena feita com os seus registros: ${notes.join(' e ')}.` };
    }
    return { ...scene, choices: shuffle(scene.choices, rng) };
  });
}

/** O gatilho que mais aparece no Diário (precisa aparecer pelo menos 2 vezes). */
export function commonTrigger(journal: readonly { triggers: readonly string[] }[]): string | undefined {
  const count = new Map<string, number>();
  for (const j of journal) for (const t of j.triggers) if (t in TRIGGER_SCENES) count.set(t, (count.get(t) ?? 0) + 1);
  const [top] = [...count.entries()].sort((a, b) => b[1] - a[1]);
  return top && top[1] >= 2 ? top[0] : undefined;
}

/** A hora com mais pedidos de ajuda (precisa de pelo menos 3). */
export function urgeHour(cravings: readonly { occurredAt: string }[]): number | undefined {
  if (cravings.length < 3) return undefined;
  const count = new Map<number, number>();
  for (const c of cravings) {
    const h = new Date(c.occurredAt).getHours();
    count.set(h, (count.get(h) ?? 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
}

/** A ação que mais vezes fez a vontade passar no SOS. */
export function provenCoping(cravings: readonly { coping: string | null; outcome: string }[]): string | undefined {
  const count = new Map<string, number>();
  for (const c of cravings) if (c.coping && c.outcome === 'passou') count.set(c.coping, (count.get(c.coping) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export interface StoryStep {
  sceneId: string;
  choice: string;
  delta: number;
  urgeAfter: number;
  /** Plano "se… então…" com a melhor saída desta cena. */
  plan: string;
}

export interface StoryState {
  urge: number;
  step: number;
  log: StoryStep[];
}

export function startStory(): StoryState {
  return { urge: START_URGE, step: 0, log: [] };
}

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** "Se {momento}, então {a escolha que mais baixou a vontade}." */
export function planFor(scene: StoryScene): string {
  const best = [...scene.choices].sort((a, b) => a.delta - b.delta)[0];
  return `Se ${scene.cue}, então ${lowerFirst(best.text)}`;
}

export function choose(state: StoryState, scene: StoryScene, choice: StoryChoice): StoryState {
  const urge = Math.min(MAX_URGE, Math.max(0, state.urge + choice.delta));
  const step = { sceneId: scene.id, choice: choice.text, delta: choice.delta, urgeAfter: urge, plan: planFor(scene) };
  return { urge, step: state.step + 1, log: [...state.log, step] };
}

export function isOver(state: StoryState, scenes: readonly StoryScene[]): boolean {
  return state.urge >= MAX_URGE || state.step >= scenes.length;
}

/** Pontos: cada escolha que baixa a vontade vale mais; terminar a noite com ela baixa dá bônus. */
export function storyScore(state: StoryState): number {
  const choices = state.log.reduce((sum, s) => sum + (s.delta < 0 ? 100 + -s.delta * 20 : s.delta === 0 ? 40 : 0), 0);
  const bonus = state.urge >= MAX_URGE ? 0 : state.urge <= 3 ? 200 : 80;
  return choices + bonus;
}

/** O momento que mais empurrou a vontade para cima: é ali que vale montar um plano. */
export function turningPoint(state: StoryState): StoryStep | null {
  return state.log.filter((s) => s.delta > 0).sort((a, b) => b.delta - a.delta)[0] ?? null;
}

export type StoryEnding = 'dormiu' | 'apertado' | 'escapou';

export function ending(state: StoryState): StoryEnding {
  if (state.urge >= MAX_URGE) return 'escapou';
  return state.urge <= 3 ? 'dormiu' : 'apertado';
}

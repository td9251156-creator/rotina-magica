/**
 * Treino diário: o "eu calmo" pratica uma técnica por dia, em 3 minutos. O que ele escreve no treino
 * vira o kit que o SOS mostra na hora da vontade. Treinar antes faz a técnica estar à mão depois
 * (prevenção de recaída: ensaiar a resposta fora da crise).
 */
import type { PlanItemKind } from '@/data/repositories/types';
import { daysBetween, type LocalDate } from './dates';

export interface TechniqueStep {
  text: string;
  /** Pede uma resposta escrita, que vai para o plano com este tipo. */
  capture?: { kind: PlanItemKind; placeholder: string; prompt?: string };
  /** Lista de opções para escolher antes de escrever (ex.: pensamentos comuns). */
  options?: readonly string[];
  /** Pausa guiada em segundos (ex.: respirar e notar o corpo). */
  pauseSeconds?: number;
  /** Espaço para escrever e pensar, opcional. Só fica guardado se apontar para o Diário. */
  reflect?: { prompt: string; placeholder: string; journal?: 'victory' };
  /** A opção escolhida (de 0 a 10) fica guardada com este nome, para ver a evolução. */
  score?: RulerScore;
  /** Texto pronto para a pessoa mandar ou mostrar a alguém (só sai do celular se ela tocar em compartilhar). */
  share?: string;
}

export type RulerScore = 'importancia' | 'confianca';

export interface Technique {
  id: string;
  title: string;
  /** Uma frase: para que serve. */
  why: string;
  steps: readonly TechniqueStep[];
}

export const PERMISSIVE_THOUGHTS = [
  'Só hoje, amanhã eu paro',
  'Eu mereço depois do dia que tive',
  'Já usei essa semana, tanto faz',
  'Ninguém vai saber',
  'Dessa vez eu controlo',
  'Estou entediado, não tem nada pra fazer',
] as const;

/** Situações de oferta para treinar a recusa. */
export const OFFER_SITUATIONS = [
  'Chega mensagem: "tem hoje, quer?"',
  'Alguém oferece pessoalmente',
  'Um amigo insiste: "só um pouco, pra relaxar"',
] as const;

/** Texto para a família: como ajudar sem vigiar nem brigar (CRAFT), e onde a família também acha apoio. */
export const FAMILY_TEXT = [
  'Estou tentando parar de usar e queria te contar como você pode me ajudar.',
  '- Não precisa vigiar nem dar bronca. Perguntar como foi o meu dia já ajuda.',
  '- Se eu disser que estou com vontade, fique comigo uns 20 minutos, por mensagem ou por perto. A vontade passa.',
  '- Se eu escorregar, não é o fim. Me ajude a voltar, sem briga.',
  '- Fazer coisas juntos, principalmente à noite e no fim de semana, ajuda muito.',
  '- Você também merece apoio: o Nar-Anon e o Amor-Exigente têm grupos de graça para familiares, e o CAPS AD também acolhe a família.',
  'Valeu por estar comigo.',
].join('\n');

const SCALE = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

export const VALUES = ['Saúde', 'Família', 'Dinheiro e independência', 'Trabalho', 'Respeito por mim', 'Liberdade', 'Amizades'] as const;

export const TECHNIQUES: readonly Technique[] = [
  {
    id: 'se_entao',
    title: 'Se acontecer, eu faço',
    why: 'Decidir antes, em frase de "se… então…", faz a resposta sair quase no automático.',
    steps: [
      { text: 'Pense no momento mais difícil: chegar em casa depois do trabalho, sozinho, sem nada pra fazer.' },
      {
        text: 'Complete com uma ação concreta, que dá para começar em 1 minuto.',
        capture: { kind: 'se_entao', prompt: 'Se eu chegar em casa e bater o tédio, então eu…', placeholder: 'troco de roupa e saio para caminhar' },
      },
      { text: 'Leia em voz alta duas vezes. Essa frase vai aparecer quando você precisar.' },
    ],
  },
  {
    id: 'surfar',
    title: 'Surfar a vontade',
    why: 'A vontade sobe, chega no pico e passa. Observar sem obedecer enfraquece ela com o tempo.',
    steps: [
      { text: 'Lembre da última vez que a vontade veio. Onde você sente no corpo? Peito, estômago, mãos, boca?' },
      { text: 'Respire devagar, soltando o ar mais longo do que puxou. Só observe, como quem olha uma onda.', pauseSeconds: 60 },
      { text: 'Repare: a sensação muda, mexe de lugar, diminui. Você não precisa fazer nada com ela.' },
      { text: 'Na próxima vontade de verdade, o SOS faz isso com você por 15 minutos.' },
    ],
  },
  {
    id: 'filme',
    title: 'Pensar o filme até o fim',
    why: 'A vontade mostra só os primeiros 10 minutos. Lembrar o resto do filme muda a decisão.',
    steps: [
      { text: 'Imagine uma noite em que você usa. Não pare na primeira parte: vá até as 3 da manhã e até o dia seguinte.' },
      {
        text: 'Escreva como essa noite termina de verdade, com suas palavras.',
        capture: { kind: 'filme', prompt: 'Quando eu uso, a noite termina assim:', placeholder: '3 da manhã acordado, sem dinheiro, o dia seguinte perdido' },
      },
      { text: 'Na hora da vontade, o SOS te mostra esse final.' },
    ],
  },
  {
    id: 'pensamentos',
    title: 'Responder ao pensamento',
    why: 'Alguns pensamentos dão permissão para usar. Ter a resposta pronta tira a força deles.',
    steps: [
      {
        text: 'Qual desses pensamentos aparece mais para você?',
        options: PERMISSIVE_THOUGHTS,
        capture: { kind: 'resposta', prompt: 'Minha resposta para esse pensamento:', placeholder: 'Amanhã eu vou pensar a mesma coisa. Hoje é o dia.' },
      },
      { text: 'Você pode voltar aqui e responder aos outros. Cada resposta entra no seu SOS.' },
    ],
  },
  {
    id: 'futuro',
    title: 'Carta para mim de amanhã',
    why: 'Escrever para o seu eu de amanhã fortalece a decisão de atravessar a vontade de hoje.',
    steps: [
      { text: 'Feche os olhos e imagine você amanhã, depois de atravessar esta vontade. Como acorda? O que gostaria de ouvir de você hoje?', pauseSeconds: 30 },
      {
        text: 'Escreva uma carta curta para você de amanhã. Fale com gentileza e conte por que vale a pena esperar a onda passar.',
        capture: { kind: 'futuro', prompt: 'Carta para mim de amanhã:', placeholder: 'Você conseguiu atravessar a vontade. Hoje você escolheu cuidar de si.' },
      },
    ],
  },
  {
    id: 'acesso',
    title: 'Dificultar o acesso',
    why: 'Cada passo a mais entre a vontade e a droga dá tempo para a onda passar.',
    steps: [
      { text: 'Escolha uma barreira que você consegue fazer hoje. Exemplos: arquivar ou silenciar o contato, baixar o limite de PIX à noite no app do banco, não levar dinheiro, voltar por outro caminho.' },
      {
        text: 'Escreva a barreira que vai fazer.',
        capture: { kind: 'barreira', prompt: 'A barreira que eu vou colocar:', placeholder: 'baixar o limite de PIX noturno para R$ 50' },
      },
      { text: 'Faça agora, se der. Levar 2 minutos hoje pode salvar uma noite.' },
    ],
  },
  {
    id: 'corpo',
    title: 'Fome, cansaço, solidão',
    why: 'Fome, raiva, solidão e cansaço aumentam a vontade. Às vezes o que falta é comer ou dormir.',
    steps: [
      { text: 'Agora: você está com fome? Cansado? Irritado? Sozinho? Repare em qual pesa mais.' },
      {
        text: 'O que resolve o que mais pesa, em 10 minutos?',
        capture: { kind: 'se_entao', prompt: 'Se eu estiver com fome, cansado ou sozinho, então eu…', placeholder: 'como algo de verdade antes de decidir qualquer coisa' },
      },
    ],
  },
  {
    id: 'recusar',
    title: 'Dizer não para a oferta',
    why: 'Recusar é uma habilidade: um "não" curto e ensaiado sai mais fácil quando a oferta chega de surpresa.',
    steps: [
      { text: 'Um "não" que funciona é curto, firme, sem desculpa longa. Depois você muda de assunto ou vai embora.' },
      {
        text: 'Qual oferta é mais provável para você?',
        options: OFFER_SITUATIONS,
        capture: { kind: 'recusa', prompt: 'Minha resposta, curta e firme:', placeholder: 'Não, parei. Valeu.' },
      },
      { text: 'Fale em voz alta três vezes, com voz firme, como se a pessoa estivesse na sua frente.', pauseSeconds: 20 },
      { text: 'O que mais protege: apagar ou bloquear o contato de quem vende. Se ainda não fez, pense em fazer hoje.' },
    ],
  },
  {
    id: 'fim_de_semana',
    title: 'Plano para o fim de semana',
    why: 'Tempo livre sem plano é quando a vontade decide. Uma noite de sexta ou sábado com hora marcada já tem dono.',
    steps: [
      { text: 'Pense na próxima sexta ou sábado à noite. O que costuma acontecer quando não tem nada marcado?' },
      {
        text: 'Marque algo com hora e lugar. Pode ser simples.',
        capture: { kind: 'plano_noite', prompt: 'Sexta ou sábado à noite eu vou…', placeholder: 'jogar futebol às 20h e jantar depois' },
      },
      { text: 'Esse plano entra nas opções de "Como vai ser sua noite?". Escolha ele quando chegar o dia.' },
    ],
  },
  {
    id: 'valores',
    title: 'O que importa para você',
    why: 'Parar fica mais fácil quando está ligado ao que você valoriza, e não só a evitar algo.',
    steps: [
      {
        text: 'Qual destes pesa mais para você agora?',
        options: VALUES,
        capture: { kind: 'razao', prompt: 'Por isso eu quero parar:', placeholder: 'quero ter dinheiro meu e confiar em mim de novo' },
      },
      { text: 'Feche os olhos 30 segundos e imagine um dia em que você viveu de acordo com isso.', pauseSeconds: 30 },
      { text: 'Essa razão vai aparecer no SOS, junto com as outras.' },
    ],
  },
  // Entrevista motivacional: balança da decisão e régua de importância e confiança.
  {
    id: 'balanca',
    title: 'Os dois lados da balança',
    why: 'Olhar com honestidade o que o uso dá e o que ele tira ajuda a decidir, sem pressão de ninguém.',
    steps: [
      {
        text: 'Sem julgamento: o que usar te dá de bom? Todo mundo usa por algum motivo.',
        reflect: { prompt: 'O que o uso me dá:', placeholder: 'energia, coragem, esquecer o dia' },
      },
      {
        text: 'E o que o uso te custa? Pense em dinheiro, sono, trabalho, pessoas e saúde.',
        reflect: { prompt: 'O que o uso me custa:', placeholder: 'o salário some, durmo mal, minto em casa' },
      },
      {
        text: 'Agora imagine alguns meses sem usar. O que fica melhor?',
        reflect: { prompt: 'O que melhora se eu parar:', placeholder: 'dinheiro sobrando, acordar bem' },
      },
      {
        text: 'Olhando os dois lados, o que pesa mais para você?',
        capture: { kind: 'razao', prompt: 'O que mais pesa para eu parar:', placeholder: 'não quero mais acordar devendo' },
      },
    ],
  },
  {
    id: 'regua',
    title: 'De 0 a 10',
    why: 'Dar uma nota para a importância de mudar e para a confiança mostra onde você já está forte.',
    steps: [
      { text: 'De 0 a 10, quanto é importante para você parar agora?', options: SCALE, score: 'importancia' },
      {
        // A pergunta "por que não menos?" faz a pessoa dizer os próprios motivos, em vez de se defender.
        text: 'Por que não um número menor? O que fez você não escolher um mais baixo?',
        capture: { kind: 'razao', prompt: 'Não escolhi um número menor porque…', placeholder: 'não quero perder mais uma semana de trabalho' },
      },
      { text: 'E de 0 a 10, quanto você confia que consegue?', options: SCALE, score: 'confianca' },
      {
        text: 'O que faria essa nota subir só um ponto?',
        reflect: { prompt: 'Minha confiança sobe se eu…', placeholder: 'tiver um plano para sexta à noite' },
      },
    ],
  },
  // Prevenção de recaída (Marlatt): decisões aparentemente irrelevantes.
  {
    id: 'decisoes',
    title: 'Escolhas que parecem inocentes',
    why: 'A recaída costuma começar horas antes, com escolhas pequenas que parecem não ter nada a ver.',
    steps: [
      {
        text: 'Alguns exemplos: passar pela rua de quem vende, sacar dinheiro "só por garantia", aceitar "só uma cerveja", guardar o contato "para emergência".',
      },
      {
        text: 'Qual escolha pequena costuma vir antes, no seu caso?',
        capture: { kind: 'sinal_alerta', prompt: 'Uma escolha que me deixa mais perto:', placeholder: 'sacar dinheiro na sexta "por garantia"' },
      },
      { text: 'Quando perceber essa escolha, pare e troque por outra. Notar cedo é quando fica mais fácil mudar o rumo.' },
    ],
  },
  // Autocompaixão: diminui a vergonha que empurra para usar de novo (efeito de violação da abstinência).
  {
    id: 'amigo',
    title: 'Como você falaria com um amigo',
    why: 'Culpa e vergonha empurram para usar de novo. Ser gentil consigo ajuda a voltar mais rápido.',
    steps: [
      { text: 'Pense num dia difícil recente, com ou sem uso. Repare no que você disse para si mesmo depois.' },
      { text: 'Agora imagine um amigo contando esse mesmo dia para você. O que você diria para ele?', pauseSeconds: 30 },
      {
        text: 'Escreva essa frase para você, do mesmo jeito.',
        capture: { kind: 'gentileza', prompt: 'Num dia difícil, eu me digo:', placeholder: 'Foi um dia pesado. Amanhã eu recomeço, e não estou sozinho.' },
      },
    ],
  },
  // Terapia de aceitação e compromisso: desfusão ("estou tendo o pensamento de que…", folhas no rio).
  {
    id: 'nome',
    title: 'Ver o pensamento de fora',
    why: 'Pensamento não é ordem. Dar um nome a ele e deixar passar tira a força sem precisar brigar.',
    steps: [
      {
        text: 'Escolha o pensamento que mais aparece. Diga devagar: "Estou tendo o pensamento de que…" e complete com ele.',
        options: PERMISSIVE_THOUGHTS,
        capture: { kind: 'resposta', prompt: 'Que nome você dá para essa história?', placeholder: 'Lá vem a história do "eu mereço" de novo' },
      },
      { text: 'Imagine folhas descendo um rio. Coloque o pensamento numa folha e deixe ir. Se vier outro, outra folha.', pauseSeconds: 60 },
      { text: 'O pensamento pode voltar. Você não precisa obedecer nem expulsar: reconheça o nome e siga com o que importa.' },
    ],
  },
  {
    id: 'revisao',
    title: 'Revisão da noite',
    why: 'Olhar o dia com calma, sem dar nota, mostra o que funcionou e lembra do que importa.',
    steps: [
      {
        text: 'O que aconteceu de mais importante hoje? Só lembre, sem julgar.',
        reflect: { prompt: 'Hoje…', placeholder: 'trabalhei, tive vontade às 19h e saí para caminhar' },
      },
      {
        text: 'Três coisas boas de hoje, mesmo pequenas.',
        reflect: { prompt: 'Coisas boas:', placeholder: 'o café, a conversa com minha irmã, dormir cedo', journal: 'victory' },
      },
      {
        text: 'O que você fez hoje combinou com o que importa para você? Escolha uma coisa para repetir amanhã.',
        reflect: { prompt: 'Amanhã eu repito:', placeholder: 'sair do trabalho direto para a academia' },
      },
    ],
  },
  {
    id: 'rede',
    title: 'Sua rede de apoio',
    why: 'Ninguém precisa fazer isso sozinho. Saber quem chamar antes facilita pedir ajuda na hora.',
    steps: [
      {
        text: 'Pense em uma ou duas pessoas que você pode chamar quando a vontade vier, mesmo sem contar tudo.',
        capture: { kind: 'pessoa', prompt: 'Quem eu posso chamar:', placeholder: 'meu irmão; o Rafa do futebol' },
      },
      { text: 'Uma mensagem curta já é um pedido de ajuda: "pode falar agora?". Se der, combine isso com essa pessoa hoje.' },
      { text: 'Grupos também ajudam. Os Narcóticos Anônimos (NA) têm reuniões de graça, presenciais e online. O CAPS AD atende pelo SUS, sem encaminhamento.' },
    ],
  },
  // Família: envolver quem está perto ajuda a buscar e manter o tratamento (CRAFT, de Meyers e Smith;
  // terapia de casal comportamental). Família também tem grupos próprios (Nar-Anon, Amor-Exigente).
  {
    id: 'conversa',
    title: 'Conversar sem briga',
    why: 'Uma conversa preparada com calma tem mais chance de virar ajuda do que discussão.',
    steps: [
      { text: 'Escolha a pessoa e a hora: um momento tranquilo, sem pressa, longe de uma noite difícil ou de cabeça quente.' },
      {
        text: 'Fale de você, começando com "eu": "Eu estou tentando parar e tem dias que fica difícil."',
        reflect: { prompt: 'O que eu quero contar:', placeholder: 'que estou tentando parar e que à noite é mais difícil' },
      },
      {
        text: 'Peça uma coisa pequena e concreta. Um pedido claro é mais fácil de atender do que "me ajuda".',
        reflect: { prompt: 'O que eu vou pedir:', placeholder: 'se eu mandar mensagem, me liga por 10 minutos' },
      },
      { text: 'Se a conversa esquentar, tudo bem parar: "Vamos continuar outra hora." Contar já foi um passo.' },
    ],
  },
  {
    id: 'texto_familia',
    title: 'Um texto para quem gosta de você',
    why: 'Quem está perto quer ajudar e muitas vezes não sabe como. Este texto explica por você.',
    steps: [
      { text: 'Leia o texto. Se fizer sentido, mande para alguém de confiança ou mostre na tela.', share: FAMILY_TEXT },
      { text: 'A família também precisa de apoio. Nar-Anon e Amor-Exigente têm grupos de graça, presenciais e online. O CAPS AD também acolhe a família.' },
    ],
  },
  {
    id: 'combinados',
    title: 'Reconstruir a confiança',
    why: 'Confiança volta com combinados pequenos cumpridos, não com promessas grandes.',
    steps: [
      { text: 'Pense em alguém que ficou chateado ou preocupado com você. O que essa pessoa mais gostaria de ver?' },
      {
        text: 'Escolha um combinado pequeno, que dá para cumprir toda semana.',
        reflect: { prompt: 'Meu combinado:', placeholder: 'avisar quando chegar em casa; jantar junto no domingo' },
      },
      { text: 'Se um dia não der, conte. Falar a verdade também reconstrói a confiança.' },
    ],
  },
];

export function findTechnique(id: string): Technique | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

/**
 * Técnica do dia: primeiro as que nunca foram praticadas, na ordem do catálogo (as primeiras
 * montam o kit do SOS mais rápido). Depois de todas, revezamento pelo dia.
 */
export function techniqueOfTheDay(today: LocalDate, practicedIds: readonly string[], start: LocalDate = today): Technique {
  const untried = TECHNIQUES.find((t) => !practicedIds.includes(t.id));
  if (untried) return untried;
  const i = ((daysBetween(start, today) % TECHNIQUES.length) + TECHNIQUES.length) % TECHNIQUES.length;
  return TECHNIQUES[i];
}

/** Notas da régua (importância e confiança) ao longo do tempo, da mais antiga para a mais nova. */
export function rulerHistory(practices: readonly { techniqueId: string; date: string; scores?: Record<string, number> }[]) {
  return practices
    .filter((p) => p.techniqueId === 'regua' && p.scores && (p.scores.importancia !== undefined || p.scores.confianca !== undefined))
    .map((p) => ({ date: p.date, importancia: p.scores!.importancia ?? null, confianca: p.scores!.confianca ?? null }));
}

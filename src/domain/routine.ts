/**
 * Rotina mágica e comportamental (baseada numa "rotina mágica" pessoal): Manhã (Preparar),
 * Tarde (Proteger) e Noite (Cuidar). Textos em linguagem simples, sem jargão. Existe também a versão
 * "simples", sem ritual, com os mesmos passos (mesmos ids) trocados por equivalentes laicos. O lado comportamental tem base: rotina estruturada e
 * atividades marcadas (CRA), respiração lenta, imagem mental competindo com a fissura,
 * automonitoramento diário. A prática espiritual é da pessoa; o app só organiza, guia e lembra.
 */
import { daysBetween, type LocalDate } from './dates';

export type PeriodId = 'manha' | 'tarde' | 'noite';
export type PracticeId = 'respiracao' | 'triangulo' | 'quebra' | 'pilar' | 'relaxar' | 'sober' | 'juramento';
export type RoutineStyle = 'magica' | 'simples';

export interface RoutineStep {
  id: string;
  title: string;
  /** Uma linha: o que é. */
  summary: string;
  /** Como fazer, em poucas frases. */
  how: string[];
  minutes: number;
  practice?: PracticeId;
  /** Passo que abre outra tela do app. */
  link?: 'diario' | 'arsenal';
}

export interface Period {
  id: PeriodId;
  title: string;
  name: string;
  purpose: string;
  steps: RoutineStep[];
}

export const ROUTINE: readonly Period[] = [
  {
    id: 'manha',
    title: 'Manhã',
    name: 'Preparar',
    purpose: 'Começar o dia no controle, antes que a correria comece.',
    steps: [
      {
        id: 'm_ra',
        title: 'Levantar e saudar o dia',
        summary: 'Sair da cama sem pegar o celular.',
        how: [
          'Levante assim que acordar. O celular pode esperar uns minutos.',
          'Vire para o lado onde o sol nasce (Leste) e faça a sua saudação ao Sol (Liber Resh), com calma.',
        ],
        minutes: 2,
      },
      {
        id: 'm_asana',
        title: 'Respirar parado',
        summary: 'Sentado, coluna reta, respiração em 4 tempos.',
        how: [
          'Sente com a coluna reta e as mãos nos joelhos. Tente ficar imóvel.',
          'Respire em 4 tempos: puxa 4, segura 4, solta 4, espera 4. Isso acalma o corpo e treina a atenção.',
          'No fim, deixe os sons e as sensações em segundo plano. Só você e a respiração.',
        ],
        minutes: 10,
        practice: 'respiracao',
      },
      {
        id: 'm_rmp',
        title: 'Ritual de proteção',
        summary: 'O ritual do pentagrama, como um escudo para o dia.',
        how: ['Faça o ritual do pentagrama (RMP) com atenção a cada gesto e a cada nome.', 'Imagine-se protegido. Hoje é você quem decide o que entra na sua vida.'],
        minutes: 5,
      },
      {
        id: 'm_juramento',
        title: 'Ler meu compromisso',
        summary: 'Em voz alta, de frente para o espelho.',
        how: ['Olhe nos seus olhos no espelho e leia o seu compromisso em voz alta, devagar.'],
        minutes: 1,
        practice: 'juramento',
      },
    ],
  },
  {
    id: 'tarde',
    title: 'Tarde',
    name: 'Proteger',
    purpose: 'Ficar atento aos momentos de risco do dia.',
    steps: [
      {
        id: 't_ahathoor',
        title: 'Pausa do meio-dia',
        summary: 'Parar um minuto e se lembrar do seu objetivo.',
        how: [
          'Onde estiver, pare um minuto. Se der, faça a saudação do meio-dia, virado para o Sul.',
          'Pergunte a si mesmo: como está meu corpo, minha cabeça e minha vontade agora?',
        ],
        minutes: 1,
      },
      {
        id: 't_gatilho',
        title: 'Se a vontade aparecer',
        summary: 'Cortar, respirar, observar sem obedecer.',
        how: [
          'Corte o pensamento na hora: um estalo leve do elástico (sem machucar) ou água gelada no pulso.',
          'Respire em 4 tempos, de olhos abertos.',
          'Observe a vontade como uma onda: ela sobe, chega no pico e passa. Você não precisa obedecer.',
        ],
        minutes: 3,
        link: 'arsenal',
      },
    ],
  },
  {
    id: 'noite',
    title: 'Noite',
    name: 'Cuidar',
    purpose: 'A hora em que a vontade costuma apertar. Descarregar o dia e descansar.',
    steps: [
      {
        id: 'n_tum',
        title: 'Chegar e desligar',
        summary: 'Deixar o dia do lado de fora.',
        how: [
          'Ao chegar em casa, faça a saudação do fim do dia, virado para o Oeste.',
          'Troque de roupa ou tome um banho: é um sinal para o corpo de que o trabalho acabou.',
        ],
        minutes: 1,
      },
      {
        id: 'n_rmp',
        title: 'Ritual de limpeza',
        summary: 'O pentagrama de novo, agora para limpar o estresse.',
        how: ['Faça o ritual do pentagrama com a intenção de soltar o cansaço, a tensão e as imagens ruins do dia.'],
        minutes: 5,
      },
      {
        id: 'n_pilar',
        title: 'Luz pelo corpo',
        summary: 'Visualização guiada: luz descendo da cabeça aos pés.',
        how: [
          'De pé. Imagine uma luz branca descendo do alto da cabeça até os pés, parando em cinco pontos (é o Pilar do Meio).',
          'Em cada ponto, fale o nome que aparece na tela. No fim, deixe a luz envolver o corpo todo.',
        ],
        minutes: 8,
        practice: 'pilar',
      },
      {
        id: 'n_diario',
        title: 'Escrever no diário',
        summary: 'Como foi a vontade, o que disparou, como você se saiu.',
        how: ['Seja honesto e gentil. O diário não julga: ele mostra o padrão.'],
        minutes: 3,
        link: 'diario',
      },
      {
        id: 'n_khephra',
        title: 'Fechar o dia',
        summary: 'Saudação da noite e celular longe da cama.',
        how: ['Antes de deitar, faça a saudação da noite, virado para o Norte.', 'Deixe o celular longe da cama. Mais um dia vivido do seu jeito.'],
        minutes: 1,
      },
    ],
  },
];

/** Rotina sem ritual: mesmos passos e ids (o histórico vale nas duas), com práticas laicas no lugar. */
const SIMPLE: Record<string, Partial<RoutineStep>> = {
  m_ra: {
    title: 'Levantar e abrir a janela',
    how: ['Levante assim que acordar. O celular pode esperar uns minutos.', 'Abra a janela, pegue luz do dia e beba um copo de água. Luz pela manhã ajuda a dormir melhor à noite.'],
  },
  m_rmp: {
    title: 'Intenção do dia',
    summary: 'Escolher o que importa hoje e prever o momento difícil.',
    how: [
      'Pense: o que eu quero fazer hoje que me deixe orgulhoso à noite?',
      'Pense também no momento mais arriscado do dia e no que você vai fazer se a vontade aparecer.',
    ],
    minutes: 2,
  },
  t_ahathoor: {
    how: ['Onde estiver, pare um minuto e respire fundo três vezes.', 'Pergunte a si mesmo: como está meu corpo, minha cabeça e minha vontade agora?'],
  },
  n_tum: {
    how: ['Ao chegar em casa, pare um instante na porta: o trabalho fica do lado de fora.', 'Troque de roupa ou tome um banho: é um sinal para o corpo de que o dia acabou.'],
  },
  n_rmp: {
    title: 'Soltar o dia',
    summary: 'Percorrer o corpo e deixar o peso do dia para trás.',
    how: [
      'Sente, feche os olhos e percorra o corpo da cabeça aos pés, soltando cada parte tensa.',
      'Se algo pesou no dia, escreva em uma linha e deixe para amanhã.',
    ],
  },
  n_pilar: {
    title: 'Relaxar o corpo',
    summary: 'Relaxamento guiado: apertar e soltar, parte por parte.',
    how: ['Deitado ou sentado. Aperte cada parte do corpo por alguns segundos e depois solte de uma vez.', 'Repare na diferença entre tenso e solto. O corpo aprende a relaxar.'],
    minutes: 3,
    practice: 'relaxar',
  },
  n_khephra: {
    how: ['Antes de deitar, lembre de uma coisa boa do dia, por menor que seja.', 'Deixe o celular longe da cama. Mais um dia vivido do seu jeito.'],
  },
};

export function routineFor(style: RoutineStyle): readonly Period[] {
  if (style === 'magica') return ROUTINE;
  return ROUTINE.map((p) => ({ ...p, steps: p.steps.map((s) => ({ ...s, ...SIMPLE[s.id] })) }));
}

/**
 * Dia difícil: só o básico, uns 8 minutos no dia. Um passo curto por período e o fechamento da noite,
 * para manter o fio da rotina sem cobrança (constância vale mais que intensidade).
 */
export const ESSENTIAL_STEP_IDS: readonly string[] = ['m_juramento', 't_gatilho', 'n_diario', 'n_khephra'];

export function essentialRoutine(periods: readonly Period[]): Period[] {
  return periods.map((p) => ({ ...p, steps: p.steps.filter((s) => ESSENTIAL_STEP_IDS.includes(s.id)) }));
}

/** O modo vale só para o dia em que foi ligado: amanhã a rotina volta inteira, sem a pessoa precisar lembrar. */
export function isHardDay(markedOn: LocalDate | null, today: LocalDate): boolean {
  return markedOn === today;
}

export const ALL_STEPS: readonly RoutineStep[] = ROUTINE.flatMap((p) => p.steps);

export function findStep(id: string, style: RoutineStyle = 'magica'): RoutineStep | undefined {
  return routineFor(style)
    .flatMap((p) => p.steps)
    .find((s) => s.id === id);
}

/** Período do dia pela hora: manhã até 12h, tarde até a saída do trabalho, noite depois. */
export function periodFor(now: Date, workEnd = '18:00'): PeriodId {
  const [h, m] = workEnd.split(':').map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes >= 4 * 60 && minutes < 12 * 60) return 'manha';
  if (minutes >= 12 * 60 && minutes < h * 60 + m) return 'tarde';
  return 'noite';
}

/** Dias com rotina: só cresce. Um dia sem rotina não apaga os outros. */
export function routineDays(activeDates: readonly LocalDate[]): number {
  return new Set(activeDates).size;
}

/** Dias com rotina nos últimos 7 (incluindo hoje). */
export function lastWeekCount(activeDates: readonly LocalDate[], today: LocalDate): number {
  return new Set(activeDates.filter((d) => d <= today && daysBetween(d, today) < 7)).size;
}

export const DEFAULT_OATH =
  'Eu escolho cuidar de mim. A cocaína não manda na minha vida: ela me tira o que eu mais quero. ' +
  'Todo dia eu fortaleço meu corpo, minha mente e a minha vontade. ' +
  'Se eu cair, levanto, aprendo e sigo. Eu estou retomando o controle.';

/** Uma fase de prática guiada: o que fazer e por quanto tempo. */
export interface PracticePhase {
  label: string;
  seconds: number;
  /** Texto menor, embaixo. */
  hint?: string;
  /**
   * O que a voz guia fala ao longo da fase, no lugar do título e da dica. Como nos áudios de
   * meditação guiada de referência, a voz acompanha cerca de metade do tempo, em frases curtas.
   */
  guide?: readonly GuideLine[];
}

/** Uma fala da voz guia: texto comum, ou um nome vibrado devagar (sílabas separadas por hífen). */
export type GuideLine = string | { intone: string; times: number };

/** O que a voz diz numa fase: a instrução e a dica, com pausa entre elas. */
export function phaseSpeech(phase: PracticePhase): string {
  return phase.hint ? `${phase.label}. ${phase.hint}` : phase.label;
}

export interface SpokenLine {
  text: string;
  /** Silêncio depois da frase, em milissegundos. */
  pauseMs: number;
  /** Sílaba de um nome vibrado: fala bem devagar e grave. */
  intone?: boolean;
}

/** Pausa curta entre pedaços de uma frase e longa entre frases, no ritmo de uma meditação guiada. */
export const SHORT_PAUSE_MS = 900;
export const LONG_PAUSE_MS = 2200;

/**
 * Quebra o texto em frases curtas (poucas palavras por vez), com silêncio entre elas, como um
 * guia de meditação falaria: pausa curta na vírgula e longa no ponto. A voz do celular não tem
 * pausa própria, então o app fala pedaço por pedaço.
 */
export function voiceScript(text: string): SpokenLine[] {
  const out: SpokenLine[] = [];
  const re = /[^.,;:!?…·]+[.,;:!?…·]*/g;
  for (const m of text.match(re) ?? []) {
    const piece = m.trim();
    const words = piece.replace(/[.,;:!?…·]+$/, '').trim();
    if (!words) continue;
    const long = /[.!?…;:]$/.test(piece);
    out.push({ text: words, pauseMs: long ? LONG_PAUSE_MS : SHORT_PAUSE_MS });
  }
  return out;
}

/** Tempo de fala estimado da voz do celular no ritmo das práticas (cerca de 12 letras por segundo). */
export const SPEECH_MS_PER_CHAR = 85;
/** Cada sílaba de um nome vibrado dura perto de um segundo. */
export const INTONE_MS_PER_SYLLABLE = 900;
/** Tempo para puxar o ar entre uma vibração e outra. */
export const INHALE_MS = 1800;
/** Nos áudios de referência, o silêncio quase nunca passa de 8 segundos. */
export const MAX_GAP_MS = 8000;

/** Um nome vibrado: sílaba por sílaba, `times` vezes, com tempo para puxar o ar entre elas. */
export function intoneScript(name: string, times: number): SpokenLine[] {
  const syllables = name.split(/[-\s]+/).filter(Boolean);
  const out: SpokenLine[] = [];
  for (let t = 0; t < times; t++)
    syllables.forEach((text, i) => out.push({ text, pauseMs: i === syllables.length - 1 ? INHALE_MS : 150, intone: true }));
  return out;
}

/** Duração estimada de um trecho falado, sem contar o silêncio depois da última frase. */
export function spokenMs(lines: readonly SpokenLine[]): number {
  return lines.reduce(
    (ms, l, i) =>
      ms + (l.intone ? INTONE_MS_PER_SYLLABLE : l.text.length * SPEECH_MS_PER_CHAR) + (i < lines.length - 1 ? l.pauseMs : 0),
    0,
  );
}

/**
 * O roteiro falado de uma fase. Sem `guide`, fala o título e a dica. Com `guide`, espalha as falas
 * pela fase inteira: o silêncio entre uma fala e outra é o que sobra do tempo, dividido por igual
 * (entre 2,2 e 8 segundos), deixando uma folga no fim para a próxima fase não cortar a voz.
 */
export function phaseScript(phase: PracticePhase): SpokenLine[] {
  if (!phase.guide?.length) return voiceScript(phaseSpeech(phase));
  const blocks = phase.guide.map((g) => (typeof g === 'string' ? voiceScript(g) : intoneScript(g.intone, g.times)));
  const speech = blocks.reduce((ms, b) => ms + spokenMs(b), 0);
  const room = phase.seconds * 1000 * 0.9 - speech;
  const gap = Math.round(Math.min(MAX_GAP_MS, Math.max(LONG_PAUSE_MS, room / blocks.length)));
  return blocks.flatMap((b) => b.map((l, i) => (i === b.length - 1 ? { ...l, pauseMs: gap } : l)));
}

export interface Practice {
  id: PracticeId;
  title: string;
  summary: string;
  phases: PracticePhase[];
}

const box = (cycles: number): PracticePhase[] =>
  Array.from({ length: cycles }, () => [
    { label: 'Inspire', seconds: 4 },
    { label: 'Segure', seconds: 4 },
    { label: 'Expire', seconds: 4 },
    { label: 'Espere', seconds: 4 },
  ]).flat();

export const PRACTICES: Record<PracticeId, Practice> = {
  respiracao: {
    id: 'respiracao',
    title: 'Respiração em 4 tempos',
    summary: 'Puxa, segura, solta, espera. Acalma o coração em poucos minutos.',
    phases: box(15),
  },
  triangulo: {
    id: 'triangulo',
    title: 'Foco no triângulo',
    summary: 'Olhos fechados e a mente ocupada com uma imagem. A vontade perde espaço.',
    phases: [
      {
        label: 'Feche os olhos',
        seconds: 30,
        hint: 'Deixe os sons e o corpo em segundo plano.',
        guide: [
          'Sente-se com a coluna reta, os ombros soltos. Feche os olhos.',
          'Puxe o ar fundo pelo nariz. E solte devagar.',
          'Deixe os sons de fora em segundo plano.',
        ],
      },
      {
        label: 'O triângulo',
        seconds: 150,
        hint: 'Imagine um triângulo vermelho brilhando, como fogo. Se a mente fugir, volte para ele.',
        guide: [
          'Agora, na sua frente, imagine um triângulo.',
          'Um triângulo vermelho, brilhando, como fogo.',
          'Veja a ponta de cima. E os dois cantos de baixo.',
          'As linhas retas, firmes, cheias de luz.',
          'Não precisa ficar perfeito. Só olhe para ele.',
          'Repare na cor. Um vermelho vivo, quente.',
          'Se um pensamento aparecer, tudo bem. Deixe passar, e volte para o triângulo.',
          'Percorra as linhas com a atenção. Subindo de um lado, descendo do outro.',
          'Respire devagar. O triângulo continua ali.',
          'A vontade pode vir, e pode ir embora. O triângulo fica.',
          'Se a mente fugir, sem problema. É só voltar.',
          'Veja o triângulo inteiro, de uma vez. Brilhando.',
          'Fique com ele mais um pouco.',
          'Agora deixe a imagem sumir, devagar.',
          'Sinta o corpo, os pés no chão. Quando quiser, abra os olhos.',
        ],
      },
    ],
  },
  quebra: {
    id: 'quebra',
    title: 'Cortar o pensamento',
    summary: 'Interromper o piloto automático na hora.',
    phases: [
      { label: 'Corte', seconds: 4, hint: 'Estalo leve do elástico, sem machucar, ou água gelada no pulso.' },
      { label: 'Diga', seconds: 6, hint: '"Quem manda na minha vida sou eu."' },
      ...box(4),
    ],
  },
  pilar: {
    id: 'pilar',
    title: 'Luz pelo corpo',
    summary: 'A luz desce por cinco pontos do corpo.',
    phases: [
      // Os nomes vão escritos como se falam em português, para a voz do celular vibrar sílaba por sílaba.
      {
        label: 'Alto da cabeça',
        seconds: 60,
        hint: 'Uma luz branca acima da cabeça. Fale: EHEIEH.',
        guide: [
          'De pé ou sentado, com a coluna reta. Feche os olhos.',
          'Puxe o ar fundo. E solte devagar.',
          'Agora imagine, logo acima da cabeça, uma esfera de luz branca.',
          'Uma luz limpa, muito brilhante.',
          'Puxe o ar, e vibre o nome, sentindo a cabeça vibrar.',
          { intone: 'É-rei-iê', times: 3 },
          'A luz fica mais forte a cada vez.',
        ],
      },
      {
        label: 'Garganta',
        seconds: 60,
        hint: 'A luz desce até a garganta. Fale: YHVH ELOHIM.',
        guide: [
          'Agora a luz desce, como um raio, até a garganta.',
          'Ali ela forma uma segunda esfera de luz.',
          'Uma luz clara, brilhando no pescoço.',
          'Puxe o ar, e vibre.',
          { intone: 'Ie-o-vá E-lo-rím', times: 2 },
          'Sinta a garganta vibrar com o som.',
        ],
      },
      {
        label: 'Coração',
        seconds: 60,
        hint: "A luz no peito, quente. Fale: YHVH ELOAH V'DAATH.",
        guide: [
          'A luz continua descendo, até o meio do peito.',
          'Uma esfera quente, dourada, no lugar do coração.',
          'Puxe o ar, e vibre.',
          { intone: 'Ie-o-vá E-lo-á Ve-da-át', times: 2 },
          'Sinta o calor se espalhar pelo peito.',
        ],
      },
      {
        label: 'Barriga',
        seconds: 60,
        hint: 'Logo abaixo do umbigo. Fale: SHADDAI EL CHAI.',
        guide: [
          'A luz desce mais, até logo abaixo do umbigo.',
          'Uma esfera de luz, firme e tranquila.',
          'Sinta essa luz bem no centro do corpo.',
          'Puxe o ar, e vibre.',
          { intone: 'Xa-dái El Rái', times: 2 },
          'A barriga firme, a respiração calma.',
        ],
      },
      {
        label: 'Pés',
        seconds: 60,
        hint: 'A luz chega aos pés e ao chão. Fale: ADONAI HA-ARETZ.',
        guide: [
          'Agora a luz desce pelas pernas, até os pés.',
          'Ela forma a última esfera, entre os pés e o chão.',
          'Puxe o ar, e vibre.',
          { intone: 'A-do-nái Ra-A-rets', times: 2 },
          'Sinta os pés firmes no chão. Você está aqui, agora.',
        ],
      },
      {
        label: 'Corpo inteiro',
        seconds: 60,
        hint: 'Deixe a luz envolver você, de cima a baixo.',
        guide: [
          'Agora veja a coluna de luz inteira, da cabeça aos pés.',
          'Ao soltar o ar, a luz desce pela frente do corpo. Ao puxar, ela sobe pelas costas.',
          'Deixe a luz envolver você, de cima a baixo.',
          'Calma e firmeza, da cabeça aos pés.',
          'Agora deixe a imagem sumir, devagar. A calma fica.',
          'Mexa os dedos. Quando quiser, abra os olhos.',
        ],
      },
    ],
  },
  relaxar: {
    id: 'relaxar',
    title: 'Relaxar o corpo',
    summary: 'Apertar e soltar, parte por parte (relaxamento muscular progressivo).',
    phases: [
      ...(
        [
          ['Pés e pernas', 'Aperte os pés e as pernas, sem dor.', 'Solte. As pernas pesadas, quentes.'],
          ['Barriga', 'Aperte a barriga.', 'Solte. A barriga mole, a respiração mais funda.'],
          ['Mãos e braços', 'Feche as mãos e aperte os braços.', 'Solte. As mãos abertas, os braços pesados.'],
          ['Ombros', 'Suba os ombros até as orelhas.', 'Solte. Os ombros descem, longe das orelhas.'],
          ['Rosto', 'Aperte os olhos e a boca.', 'Solte. A testa lisa, o queixo solto.'],
        ] as const
      ).flatMap(([part, squeeze, release]) => [
        { label: `Aperte · ${part}`, seconds: 5, hint: 'Força média, sem dor.', guide: [squeeze] },
        {
          label: `Solte · ${part}`,
          seconds: 15,
          hint: 'Solte de uma vez e repare na diferença.',
          guide: [release, 'Respire. E deixe soltar mais um pouco.'],
        },
      ]),
      {
        label: 'Corpo inteiro',
        seconds: 30,
        hint: 'Respire devagar. O corpo todo pesado e solto.',
        guide: [
          'Agora o corpo inteiro. Respire devagar.',
          'Cada vez que o ar sai, você solta mais um pouco.',
          'Fique assim, pesado e solto. Quando quiser, volte devagar.',
        ],
      },
    ],
  },
  // Espaço de respiração da prevenção de recaída com atenção plena (MBRP, Bowen): Pare, Observe, Respire,
  // Amplie, Responda. Feito para o meio de uma situação difícil, em 3 minutos.
  sober: {
    id: 'sober',
    title: 'Parar e respirar',
    summary: 'Três minutos para sair do piloto automático: pare, observe, respire, amplie, escolha.',
    phases: [
      {
        label: 'Pare',
        seconds: 10,
        hint: 'Onde você estiver, pare o que está fazendo.',
        guide: ['Pare o que está fazendo.', 'Se der, feche os olhos.'],
      },
      {
        label: 'Observe',
        seconds: 45,
        hint: 'O que o corpo sente? Que emoção está aí? Que pensamento? Só repare, sem brigar.',
        guide: [
          'Agora observe. O que o corpo está sentindo?',
          'Um aperto, calor, o coração rápido. Só repare.',
          'Que emoção está aí? Raiva, tédio, tristeza?',
          'E que pensamento está passando? Só repare, sem brigar.',
          'Nada precisa mudar agora. Você só está olhando.',
        ],
      },
      {
        label: 'Respire',
        seconds: 60,
        hint: 'Atenção no ar entrando e saindo. Se a mente fugir, volte com calma.',
        guide: [
          'Agora leve a atenção para a respiração.',
          'O ar entrando. E saindo.',
          'A barriga sobe, e desce.',
          'Não precisa controlar. Só acompanhe.',
          'Se a mente fugir, tudo bem. Volte com calma para o ar.',
          'Sinta o ar fresco entrando, e morno saindo.',
          'Inspirando. E soltando.',
          'Mais uma vez. Inspirando. E soltando.',
        ],
      },
      {
        label: 'Amplie',
        seconds: 40,
        hint: 'Sinta o corpo inteiro, os pés no chão, o lugar onde você está.',
        guide: [
          'Agora abra a atenção para o corpo inteiro.',
          'Os pés no chão. As mãos. O rosto.',
          'O lugar onde você está, os sons em volta.',
          'A vontade pode estar aqui. E você é maior do que ela.',
        ],
      },
      {
        label: 'Escolha',
        seconds: 25,
        hint: 'Com mais calma: qual é o próximo passo que cuida de você?',
        guide: [
          'Com mais calma, pergunte: qual é o próximo passo que cuida de você?',
          'Pode ser pequeno. Um copo de água, uma mensagem, sair dali.',
        ],
      },
    ],
  },
  juramento: { id: 'juramento', title: 'Meu compromisso', summary: 'Ler em voz alta.', phases: [] },
};

export function practiceSeconds(p: Practice): number {
  return p.phases.reduce((s, f) => s + f.seconds, 0);
}

/** Em que fase a prática está depois de `elapsed` segundos (null quando terminou). */
export function phaseAt(p: Practice, elapsed: number): { index: number; phase: PracticePhase; left: number } | null {
  let t = elapsed;
  for (let i = 0; i < p.phases.length; i++) {
    if (t < p.phases[i].seconds) return { index: i, phase: p.phases[i], left: p.phases[i].seconds - t };
    t -= p.phases[i].seconds;
  }
  return null;
}

export const TRIGGERS = ['Estresse', 'Tédio', 'Raiva', 'Solidão', 'Cansaço', 'Álcool', 'Dinheiro na mão', 'Oferta ou mensagem'] as const;

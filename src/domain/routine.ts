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
      { label: 'Feche os olhos', seconds: 10, hint: 'Deixe os sons e o corpo em segundo plano.' },
      { label: 'O triângulo', seconds: 170, hint: 'Imagine um triângulo vermelho brilhando, como fogo. Se a mente fugir, volte para ele.' },
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
      { label: 'Alto da cabeça', seconds: 60, hint: 'Uma luz branca acima da cabeça. Fale: EHEIEH.' },
      { label: 'Garganta', seconds: 60, hint: 'A luz desce até a garganta. Fale: YHVH ELOHIM.' },
      { label: 'Coração', seconds: 60, hint: "A luz no peito, quente. Fale: YHVH ELOAH V'DAATH." },
      { label: 'Barriga', seconds: 60, hint: 'Logo abaixo do umbigo. Fale: SHADDAI EL CHAI.' },
      { label: 'Pés', seconds: 60, hint: 'A luz chega aos pés e ao chão. Fale: ADONAI HA-ARETZ.' },
      { label: 'Corpo inteiro', seconds: 60, hint: 'Deixe a luz envolver você, de cima a baixo.' },
    ],
  },
  relaxar: {
    id: 'relaxar',
    title: 'Relaxar o corpo',
    summary: 'Apertar e soltar, parte por parte (relaxamento muscular progressivo).',
    phases: [
      ...['Pés e pernas', 'Barriga', 'Mãos e braços', 'Ombros', 'Rosto'].flatMap((part) => [
        { label: `Aperte · ${part}`, seconds: 5, hint: 'Força média, sem dor.' },
        { label: `Solte · ${part}`, seconds: 15, hint: 'Solte de uma vez e repare na diferença.' },
      ]),
      { label: 'Corpo inteiro', seconds: 30, hint: 'Respire devagar. O corpo todo pesado e solto.' },
    ],
  },
  // Espaço de respiração da prevenção de recaída com atenção plena (MBRP, Bowen): Pare, Observe, Respire,
  // Amplie, Responda. Feito para o meio de uma situação difícil, em 3 minutos.
  sober: {
    id: 'sober',
    title: 'Parar e respirar',
    summary: 'Três minutos para sair do piloto automático: pare, observe, respire, amplie, escolha.',
    phases: [
      { label: 'Pare', seconds: 10, hint: 'Onde você estiver, pare o que está fazendo.' },
      { label: 'Observe', seconds: 45, hint: 'O que o corpo sente? Que emoção está aí? Que pensamento? Só repare, sem brigar.' },
      { label: 'Respire', seconds: 60, hint: 'Atenção no ar entrando e saindo. Se a mente fugir, volte com calma.' },
      { label: 'Amplie', seconds: 40, hint: 'Sinta o corpo inteiro, os pés no chão, o lugar onde você está.' },
      { label: 'Escolha', seconds: 25, hint: 'Com mais calma: qual é o próximo passo que cuida de você?' },
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

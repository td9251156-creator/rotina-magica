/**
 * Terapias e vivências: os exercícios do app agrupados pela abordagem de onde vêm, com o que cada
 * uma faz e a base que tem em dependência. Só entram abordagens com estudos em uso de drogas; a
 * prática espiritual fica à parte, como apoio opcional que não substitui tratamento.
 */
import type { PracticeId } from './routine';

export type TherapyItem =
  | { kind: 'tecnica'; id: string }
  | { kind: 'pratica'; id: PracticeId }
  | { kind: 'atalho'; route: 'pensamento' | 'jogos' | 'sons'; param?: string; title: string; why: string };

export interface Approach {
  id: string;
  /** Em linguagem simples, o que a pessoa vai fazer. */
  title: string;
  /** Nome da terapia, para quem quiser procurar ou conversar com um profissional. */
  name: string;
  what: string;
  evidence: string;
  items: readonly TherapyItem[];
}

const t = (id: string): TherapyItem => ({ kind: 'tecnica', id });

export const APPROACHES: readonly Approach[] = [
  {
    id: 'motivacao',
    title: 'Encontrar seus motivos',
    name: 'Entrevista motivacional',
    what: 'Sem sermão e sem pressão: você mesmo descobre por que e quando quer mudar.',
    evidence: 'Muito estudada em dependência de álcool e outras drogas (Miller e Rollnick).',
    items: [t('balanca'), t('regua')],
  },
  {
    id: 'recaida',
    title: 'Preparar os momentos de risco',
    name: 'Terapia cognitivo-comportamental e prevenção de recaída',
    what: 'Prever as situações difíceis e ensaiar a resposta com a cabeça tranquila.',
    evidence: 'Uma das terapias com mais estudos para quem quer parar de usar cocaína (Carroll; Marlatt).',
    items: [
      t('se_entao'),
      t('pensamentos'),
      {
        kind: 'atalho',
        route: 'pensamento',
        title: 'Desatar um pensamento',
        why: 'Quando a cabeça insiste: do corpo até a resposta, em 4 degraus.',
      },
      t('decisoes'),
      t('acesso'),
      t('corpo'),
      t('recusar'),
      t('fim_de_semana'),
      t('amigo'),
    ],
  },
  {
    id: 'atencao',
    title: 'Observar sem obedecer',
    name: 'Atenção plena (mindfulness)',
    what: 'Notar a vontade, o corpo e os pensamentos sem brigar e sem obedecer. A onda passa.',
    evidence: 'A prevenção de recaída com atenção plena reduziu o uso de drogas num estudo de 2014 (Bowen e colegas).',
    items: [
      { kind: 'pratica', id: 'sober' },
      { kind: 'atalho', route: 'jogos', param: 'onda', title: 'Segura a onda', why: 'Jogo de respirar devagar, no ritmo da onda.' },
      { kind: 'atalho', route: 'sons', title: 'Sons para relaxar', why: 'Sons binaurais no fone: calma, relaxar fundo ou pegar no sono.' },
    ],
  },
  {
    id: 'vontade',
    title: 'Lidar com a vontade',
    name: 'TCC e atenção plena',
    what: 'Observar a vontade sem obedecer, lembrar o filme inteiro e conversar com o seu eu de amanhã.',
    evidence: 'Combina prevenção de recaída e atenção plena: notar a vontade, reduzir o automatismo e escolher o próximo passo.',
    items: [t('surfar'), t('filme'), t('futuro')],
  },
  {
    id: 'aceitacao',
    title: 'Viver pelo que importa',
    name: 'Terapia de aceitação e compromisso (ACT)',
    what: 'Dar espaço para o pensamento difícil e escolher agir pelo que você valoriza.',
    evidence: 'Estudos menores, com resultados promissores em dependência.',
    items: [t('nome'), t('valores'), t('revisao')],
  },
  {
    id: 'apoio',
    title: 'Não fazer isso sozinho',
    name: 'Rede de apoio e tratamento',
    what: 'Pessoas, grupos e serviços de saúde. Com companhia, a recuperação dura mais.',
    evidence: 'Num grande estudo com cocaína (NIDA, 1999), aconselhamento com grupos de apoio foi o que mais ajudou.',
    items: [t('rede')],
  },
  {
    id: 'familia',
    title: 'Trazer a família para perto',
    name: 'Terapia com a família (CRAFT) e grupos para familiares',
    what: 'Contar, pedir ajuda do jeito certo e reconstruir a confiança. A família também tem onde se apoiar.',
    evidence: 'Envolver a família ajuda a buscar e manter o tratamento. No CRAFT, cerca de 2 em cada 3 familiares treinados levaram a pessoa a buscar ajuda (Meyers e Smith).',
    items: [t('conversa'), t('texto_familia'), t('combinados')],
  },
];

/** Ids das técnicas de uma abordagem, para contar quantas a pessoa já praticou. */
export function techniqueIds(approach: Approach): string[] {
  return approach.items.flatMap((i) => (i.kind === 'tecnica' ? [i.id] : []));
}

export function approachOf(techniqueId: string): Approach | undefined {
  return APPROACHES.find((a) => techniqueIds(a).includes(techniqueId));
}

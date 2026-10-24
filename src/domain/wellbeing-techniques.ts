import type { Technique } from './training';

export const GENERAL_TECHNIQUES: readonly Technique[] = [
  {
    id: 'ancorar_sentidos', title: 'Voltar para o aqui e agora',
    why: 'Uma pausa para notar o lugar onde você está, sem precisar resolver tudo agora.',
    steps: [
      { text: 'Se estiver confortável, apoie os pés no chão. Você pode manter os olhos abertos. Encontre uma posição que pareça segura.' },
      { text: 'Olhe ao redor e procure cinco coisas que você consegue ver. Repare nas cores e nas formas.', pauseSeconds: 20 },
      { text: 'Note três pontos de contato do corpo: os pés no chão, as costas na cadeira, a roupa na pele. Se isso incomodar, apenas observe objetos ao redor.', pauseSeconds: 20 },
      { text: 'Escute dois sons. Depois escolha um cuidado pequeno para os próximos minutos: beber água, descansar ou chamar alguém.', reflect: { prompt: 'Meu próximo cuidado, se eu quiser anotar:', placeholder: 'Vou tomar água e sentar perto da janela.' } },
    ],
  },
  {
    id: 'pausa_corpo', title: 'Dar uma pausa ao corpo',
    why: 'Notar a tensão e encontrar um pouco mais de conforto, sem forçar a respiração.',
    steps: [
      { text: 'Apoie o corpo de um jeito confortável. Solte os ombros e descruze as mãos, se isso fizer sentido para você.' },
      { text: 'Deixe o ar entrar e sair no seu ritmo. Sem prender o ar e sem tentar respirar muito fundo. Se der desconforto, pare e olhe ao redor.', pauseSeconds: 30 },
      { text: 'Perceba se há alguma região que pode descansar um pouco. Não precisa mudar o que está sentindo.', pauseSeconds: 20 },
      { text: 'Antes de seguir, o que seu corpo está pedindo?', options: ['Água', 'Comida', 'Descanso', 'Movimento leve', 'Um lugar mais tranquilo'], reflect: { prompt: 'Um cuidado possível agora:', placeholder: 'Vou fazer uma pausa de cinco minutos.' } },
    ],
  },
  {
    id: 'acolher_momento', title: 'Ser gentil comigo agora',
    why: 'Dar espaço ao que dói e encontrar palavras menos duras para atravessar o momento.',
    steps: [
      { text: 'Pense no que está difícil, sem precisar reviver detalhes. Se preferir, fique apenas com a sensação de hoje.' },
      { text: 'O que você diria a uma pessoa querida que estivesse passando por algo parecido? Não precisa encontrar o conselho perfeito.', pauseSeconds: 20 },
      { text: 'Experimente oferecer essas palavras a você.', capture: { kind: 'gentileza', prompt: 'Uma frase que me acolhe:', placeholder: 'Está sendo difícil. Posso ir com calma e pedir ajuda.' } },
      { text: 'A frase fica no seu kit pessoal. Você pode reler ou trocar depois. Não precisa estar bem para merecer cuidado.' },
    ],
  },
  {
    id: 'pensamento_distante', title: 'Dar espaço a um pensamento',
    why: 'Olhar para uma ideia difícil como um pensamento, sem precisar tratá-la como uma certeza.',
    steps: [
      { text: 'Qual pensamento está ocupando espaço hoje?', reflect: { prompt: 'Minha cabeça está dizendo…', placeholder: 'Não vou dar conta de tudo.' } },
      { text: 'Tente dizer: “Estou tendo o pensamento de que…”. Complete com a mesma frase. Repare se isso cria um pouco de espaço.', pauseSeconds: 20 },
      { text: 'Sem discutir com esse pensamento, qual ação pequena cuidaria de você agora?', capture: { kind: 'se_entao', prompt: 'Quando esse pensamento aparecer, eu posso…', placeholder: 'Fazer uma coisa por vez e pedir ajuda com o restante.' } },
    ],
  },
  {
    id: 'proximo_passo', title: 'Uma coisa de cada vez',
    why: 'Diminuir o tamanho da próxima ação quando tudo parece demais.',
    steps: [
      { text: 'Você não precisa organizar a vida inteira agora. Escolha só o que mais pede cuidado neste momento.', options: ['Corpo e descanso', 'Uma tarefa', 'Uma conversa', 'Uma preocupação', 'Ainda não sei'] },
      { text: 'Qual é a menor ação possível, que cabe em poucos minutos?', capture: { kind: 'se_entao', prompt: 'Meu próximo passo pequeno:', placeholder: 'Abrir a janela, tomar água ou responder uma mensagem.' } },
      { text: 'O que pode esperar um pouco? Deixar algo para depois também pode ser uma escolha de cuidado.', reflect: { prompt: 'Por agora, posso deixar para depois…', placeholder: 'Resolver todas as pendências hoje.' } },
    ],
  },
  {
    id: 'pedir_apoio', title: 'Pedir companhia',
    why: 'Preparar um pedido simples a alguém que respeite você e seus limites.',
    steps: [
      { text: 'Pense em alguém com quem você se sente respeitado. Não precisa ser da família nem saber de tudo.', capture: { kind: 'pessoa', prompt: 'Quem eu posso procurar:', placeholder: 'Uma amiga, um colega, alguém do meu cuidado profissional.' } },
      { text: 'Um pedido pode ser pequeno. Leia esta sugestão e compartilhe só se quiser.', share: 'Estou passando por um momento difícil. Você pode conversar comigo um pouco? Não precisa resolver nada; sua companhia já ajuda.' },
      { text: 'Se ninguém estiver disponível agora, você pode tentar outra pessoa ou retomar este pedido mais tarde. Não precisa resolver tudo nesta conversa.' },
    ],
  },
  {
    id: 'limites_cuidado', title: 'Colocar um limite com cuidado',
    why: 'Encontrar uma forma de proteger seu tempo e sua energia sem precisar explicar tudo.',
    steps: [
      { text: 'Qual situação está exigindo mais do que você consegue oferecer agora?', reflect: { prompt: 'O que pesa para mim:', placeholder: 'Aceitar mais tarefas quando já estou sem energia.' } },
      { text: 'Prepare uma frase simples. Você pode ser claro e respeitoso ao mesmo tempo.', capture: { kind: 'recusa', prompt: 'Uma frase que eu posso usar:', placeholder: 'Hoje não consigo assumir isso. Podemos conversar amanhã?' } },
      { text: 'Se colocar um limite trouxer risco à sua segurança, priorize se proteger e buscar apoio. Não é preciso enfrentar essa conversa agora.' },
    ],
  },
  {
    id: 'preparar_sono', title: 'Preparar o corpo para dormir',
    why: 'Soltar o corpo aos poucos e tirar as preocupações da cabeça antes de deitar, sem forçar o sono.',
    steps: [
      { text: 'Deite ou sente de um jeito confortável, com a luz baixa. Não precisa fazer o sono chegar; só vamos deixar o corpo mais à vontade.' },
      { text: 'Leve a atenção aos pés e às pernas. Deixe que pesem um pouco mais sobre a cama, no seu ritmo.', pauseSeconds: 20 },
      { text: 'Agora a barriga, as costas e os ombros. Solte o que der para soltar. Se algo continuar tenso, tudo bem.', pauseSeconds: 20 },
      { text: 'Por fim, o rosto: a testa, os olhos e a mandíbula. Deixe a língua descansar e os dentes se afastarem um pouco.', pauseSeconds: 20 },
      { text: 'Se alguma preocupação estiver rondando, deixe anotada para amanhã. Ela fica guardada aqui e não precisa ser resolvida agora.', reflect: { prompt: 'Fica para amanhã:', placeholder: 'Responder a mensagem do trabalho.' } },
      { text: 'Se o sono não vier em uns 20 minutos, você pode levantar, fazer algo calmo com pouca luz e voltar quando sentir sono. Isso também é cuidar do sono.' },
    ],
  },
  {
    id: 'revisao_gentil', title: 'Fechar o dia sem cobrança',
    why: 'Reconhecer como foi o dia e escolher um cuidado para amanhã, sem exigir um dia perfeito.',
    steps: [
      { text: 'Como foi atravessar este dia? Pode ter sido bom, pesado ou uma mistura. Não precisa transformar tudo em aprendizado.', reflect: { prompt: 'Hoje foi…', placeholder: 'Cansativo. Fiz o que foi possível.', journal: 'victory' } },
      { text: 'Houve algum cuidado, encontro ou alívio pequeno? Tudo bem se hoje você não encontrar um.', reflect: { prompt: 'Se eu quiser lembrar de algo:', placeholder: 'Consegui descansar um pouco e aceitar ajuda.' } },
      { text: 'O que faria o começo de amanhã um pouco mais gentil?', reflect: { prompt: 'Um cuidado para amanhã:', placeholder: 'Deixar um copo de água por perto e começar sem pressa.' } },
    ],
  },
];

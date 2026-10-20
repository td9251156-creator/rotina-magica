# ROADMAP — Rotina Mágica

Prioridade: o que mais ajuda em momento de crise primeiro. Detalhes e justificativas em
[`docs/visao-produto.md`](docs/visao-produto.md).

## Em andamento
- Testar o app completo no celular, no uso real.
- Trazer contribuidores: issues "good first issue" e "help wanted" abertas; artigo contando como o app foi feito.

## Próximos
- Narração com voz mais humana: gerar com Azure (`--engine azure`) ou gravar com voz de gente (passos em `docs/roteiro-narracao.md`).
- Mais modos difíceis desbloqueados por nível (Pares, Arcanos), no mesmo molde do modo rápido do Blocos.
- Ajustar textos e técnicas com o uso real (o laboratório vai mostrar o que funciona).
- Empacotar como app Android (TWA/Capacitor) se a agenda não bastar como lembrete.

## Depois
- Dados permanecem 100% locais; sincronização entre aparelhos não faz parte do produto.
- ~~Recompensas~~: recusadas pelo autor; dinheiro mantido só como informação.

## Feito
- 2026-10-18 — Jogos: saíram Desvia e Rebate (XP e histórico ficam); Pares, Arcanos, Blocos e Segura a onda
  ocupam a tela toda, com peças e cartas maiores. Ajuda agora: onda da vontade desenhada.
- 2026-10-18 — Narração mais fluida: frases inteiras, sem cortes nem tom rebaixado, reverberação de sala; falas
  reescritas com linguagem de relaxamento guiado (hipnose permissiva, âncora de calma e ensaio do futuro);
  gerador com opção de voz Azure (`pt-BR-AntonioNeural`) e caminho para gravação com voz de gente.
- 2026-10-18 — Mais itens: A noite passa a ensaiar a noite da própria pessoa (cena do gatilho mais comum do Diário,
  na hora em que a vontade costuma apertar, com o que já fez a vontade passar no SOS como saída); desafio da semana
  na tela Hoje (seis metas de prática que giram por semana, com troca antes de começar); lembrete do meio-dia em
  Ajustes, abrindo direto a pausa da rotina; modo rápido do Blocos a partir do nível 3. Correção: com o PIN fechado,
  os jogos do SOS não mostram mais as respostas escritas pela pessoa.
- 2026-10-17 — Melhorias gerais: o Clima de hoje oferece um lembrete na agenda meia hora antes da hora de risco,
  só nos dias que pedem atenção; com a voz ligada, a narração inteira fica guardada para tocar sem internet; texto do
  "Diário e noites" no Laboratório corrigido; prévia discreta do link (descrição e imagem) para quem compartilha.
- 2026-10-17 — Voz nas práticas, parte 2: narração com voz neural (Kokoro-82M, voz masculina `pm_alex`, Apache-2.0)
  gerada no computador para triângulo, Luz pelo corpo, relaxar e parar e respirar (24 arquivos, 2,2 MB), tocando
  sem internet depois da primeira vez. Gerador em `scripts/gerar-narracao.py`.
- 2026-10-17 — Práticas guiadas no ritmo dos áudios de referência: a voz acompanha a fase inteira em falas curtas
  (triângulo, Luz pelo corpo, relaxar, parar e respirar), vibra os nomes sílaba por sílaba, prefere voz masculina
  local e ganhou "Som de fundo" gerado no aparelho. Roteiro para gravar em `docs/roteiro-narracao.md`.
- 2026-10-17 — Jogos, parte 4: Pares ganhou o tabuleiro intermediário Jardim, com 44 peças e um desafio diário
  opcional reproduzível pela data local, mantendo a garantia de partida solucionável.
- 2026-10-17 — Jogos, parte 4: Desvia passou a limpar gestos cancelados pelo navegador e anunciar a carta
  para leitores de tela, sem mudar a pontuação.
- 2026-10-17 — Jogos, parte 4: Rebate passou a remover alternativas duplicadas quando a resposta pessoal
  coincide com uma armadilha, mantendo três opções distintas.
- 2026-10-17 — Jogos, parte 4: Segura a onda passou a capturar o ponteiro e tratar cancelamento, evitando
  que sair visualmente do botão interrompa o ciclo.
- 2026-10-17 — Voz nas práticas, parte 2 (preparação): o player aceita MP3s narrados estáticos e volta
  automaticamente para a voz local quando eles não estão publicados.
- 2026-10-17 — Laboratório: cruzamento entre notas de vontade do Diário e noites sem usar ou com uso,
  exibido apenas com dados suficientes e sem sugerir causalidade.
- 2026-10-17 — Lembretes: Ajustes ganhou um segundo lembrete opcional da manhã, em arquivo de agenda separado;
  o lembrete da saída continua funcionando como antes.
- 2026-10-17 — Terapias e vivências: criado o grupo “Lidar com a vontade”, com três exercícios curtos de
  TCC e atenção plena; os passos podem ser lidos pela voz guiada já existente.
- 2026-10-17 — Voz nas práticas guiadas (#7): botão "Ouvir a voz guiando" no player (respiração, triângulo, SOS…),
  com a voz do próprio celular, sem internet. Desligada por padrão; a escolha fica guardada (`practiceVoice`).
- 2026-10-17 — Terapias e vivências, parte 3: grupo "Trazer a família para perto" (conversar sem briga, um texto pronto
  para mandar a quem gosta de você, com Nar-Anon e Amor-Exigente, e reconstruir a confiança) e modo "dia difícil" na
  tela Hoje (só 4 passos curtos, vale só para o dia).
- 2026-10-17 — Terapias e vivências, parte 2: "Parar e respirar" na Ajuda agora, régua de 0 a 10 com evolução no
  laboratório, revisão da noite indo para o Diário e "fique de olho" no Clima de hoje. 170 testes.
- 2026-10-17 — Desenhos novos: 47 ícones do app, 24 símbolos dos jogos e o logo (ícone da tela inicial), feitos por
  outra IA a partir dos prompts em `docs/` e conferidos por teste.
- 2026-10-17 — Jogos, parte 3: símbolos do ocultismo (liga e desliga em Jogos). Pares com planetas e signos, Blocos
  subindo a Árvore da Vida e jogo novo "Arcanos" (memória com os Arcanos Maiores). Visual simples até os desenhos chegarem.
- 2026-10-17 — Jogos, parte 2: Blocos como um Tetris de verdade: guardar peça, 3 próximas, sombra em contorno, combo e
  quatro linhas seguidas com bônus, nível que acelera com aviso, pausa (sozinha ao sair do app), meio segundo para ajustar
  a peça apoiada e blocos com relevo. Em Ajustes, de ajuda externa ficou só "CVV 188" discreto.
- 2026-10-17 — Jogos, parte 1: "Pares", paciência estilo Mahjong com partida curta e pirâmide, dica, embaralhar e
  desfazer. Saiu o cartão "Ajuda de gente". 148 testes.
- 2026-10-17 — Terapias e vivências, parte 1: exercícios agrupados por terapia (entrevista motivacional, TCC e prevenção
  de recaída, atenção plena, ACT, rede de apoio), 7 vivências novas e a prática guiada "Parar e respirar". 141 testes.
- 2026-10-17 — Visual e facilidade de uso: Ajustes curtos (itens que abrem e fecham), passos da rotina num cartão só com
  check mais visível, barra de progresso por período, data no topo, ferramentas em grade, aba ativa destacada, botão
  Instalar, "Falar com alguém agora" no topo da Ajuda agora e técnicas com nomes simples. 132 testes.
- 2026-10-17 — Clima de hoje (previsão de risco com os dados do aparelho), rotina com ou sem ritual, relaxamento muscular
  progressivo guiado, carta do eu calmo na Ajuda agora, tema claro seguindo o celular, e o projeto pronto para código
  aberto (MIT, CONTRIBUTING, código de conduta, SECURITY, modelos de issue e PR, README novo com imagens). 131 testes.
- 2026-10-16 — "Rotina Mágica": novo nome, cores exatas do Lições do Dia, textos sem jargão, tela Hoje com anel do dia,
  próximo passo e períodos que abrem com um toque; "Desatar um pensamento" (TCC em 4 degraus) ligado ao Diário e à Ajuda
  agora, com as armadilhas mais comuns da pessoa. 124 testes.
- 2026-10-16 — Recomeço do zero em volta da "rotina mágica": abas Rotina / Arsenal / Diário / Ajustes; rotina em Manhã
  (Forja), Tarde (Trincheira) e Noite (Cura) com o período atual em destaque; práticas guiadas com tempo (4-4-4-4,
  Triângulo, Quebra do automatismo, Pilar do Meio); Juramento editável; Diário Mágico (fissura, gatilhos, quebras,
  como a mente enganou, como venceu) com 14 dias em barras; visual noturno com dourado. 120 testes.
- 2026-10-16 — Rodada 3: treinos "Dizer não para a oferta", "Plano para o fim de semana" e "O que importa para você"
  (10 técnicas); A noite com 3 versões por momento (sexta, festa, tédio, "eu controlo", app do banco); SOS com "Chamar
  alguém no WhatsApp"; laboratório e modo cuidado com CAPS AD, NA e CVV por chat (links, sem enviar dados). 114 testes.
- 2026-10-16 — Interface: SOS mostra as 3 ações que mais funcionaram (resto em "Mais opções"), ícones e selo "hoje" nos
  jogos, grade sem buraco, setas na missão, entrada própria para os treinos de mente, resposta visual ao toque e
  remover do kit com dois toques. 112 testes.
- 2026-10-16 — Revisão de melhorias: ajuda a um toque já no primeiro uso, notas 0–10 do SOS maiores (duas fileiras),
  o ponto que mais pesou em "A noite" vira um "se… então…" guardado no SOS, lembrete de backup a cada 14 dias. 110 testes.
- 2026-10-16 — Student Pack e privacidade: PIN (o SOS abre sem PIN e esconde o kit), backup cifrado com senha, jogo
  "A noite" (ensaio da noite de risco com o plano da pessoa), modo demonstração `?demo`, Codespaces, instruções do Copilot,
  README de apresentação e guia do Pack (`docs/student-pack.md`). 105 testes.
- 2026-10-16 — Jogos: Blocos (encaixe, 3 min no SOS), Desvia (empurrar gatilho/puxar o que quer), Rebate (derrubar
  pensamentos permissivos, usa as respostas da pessoa), Segura a onda (respiração no ritmo do dedo). XP e níveis, missão de
  hoje (jogo do dia + treino + plano da noite), SOS com nota antes/depois, laboratório mostra o que baixa a vontade.
- 2026-10-16 — App completo decidido por Claude (pedido do autor): treino diário de 7 técnicas que monta o kit do
  SOS; SOS que aprende quais ações funcionam; registro da noite anterior em 10 s; laboratório pessoal (planos que
  funcionaram, dia mais pesado, álcool, o que veio antes); registro de uso sem julgamento com modo cuidado de 36 h,
  3 perguntas e um ajuste; tela inicial que muda com a hora; lembrete pela agenda; backup. 63 testes.
- 2026-10-16 — Troca de Expo por PWA (Vite + React) publicado no GitHub Pages: abre por link, instala na
  tela inicial, funciona offline, dados no próprio celular. Atalho "Agora" para o SOS. 39 testes.
- 2026-10-16 — Etapa 1: primeiro uso em 4 telas (horário de saída, o que gosta, por que quer parar,
  planos de noite gerados priorizando sair de casa e ver gente), tela inicial "sua noite de hoje"
  com escolha e troca de plano; SOS e progresso em segundo plano. Tabela `evening_choices`.
- 2026-10-16 — Ciclo 1: projeto Expo SDK 58 + TypeScript, SQLite + Drizzle com migrações e
  repositórios, progresso que nunca zera, tela inicial com progresso, SOS com timer da onda,
  respiração, ações contra tédio/solidão e CVV/SAMU. 22 testes, ESLint, CI no GitHub Actions.
- 2026-10-16 — Ciclo 0: documentação inicial e plano de produto.

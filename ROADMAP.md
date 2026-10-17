# ROADMAP — Rotina Mágica

Prioridade: o que mais ajuda em momento de crise primeiro. Detalhes e justificativas em
[`docs/visao-produto.md`](docs/visao-produto.md).

## Em andamento
- Testar o app completo no celular, no uso real.
- Trazer contribuidores: issues "good first issue" e "help wanted" abertas; artigo contando como o app foi feito.

## Próximos
- Jogos, parte 3: mais tabuleiros e desafio do dia no Pares; depois, um jogo novo por rodada.
- Terapias e vivências, parte 2: "Parar e respirar" também na Ajuda agora; notas da régua de 0 a 10 guardadas para ver a
  evolução no laboratório; revisão da noite ligada ao Diário; escolhas que parecem inocentes no Clima de hoje.
- Terapias e vivências, parte 3: vivências para a família (Nar-Anon, Amor-Exigente) e modo "dia difícil" (só o básico da
  rotina, sem cobrança).
- Voz nas práticas guiadas: primeiro a do próprio celular (#7), depois áudio narrado publicado junto com o app (`docs/integracoes.md`).
- Laboratório cruzando o Diário (gatilhos, quebras) com as noites sem usar.
- Lembrete por período (manhã, Ahathoor ao meio-dia) na agenda, se a pessoa quiser mais de um.
- Desafios semanais e modos difíceis desbloqueados por nível.
- Ajustar textos e técnicas com o uso real (o laboratório vai mostrar o que funciona).
- Cenas de A noite que aprendem com o laboratório (usar os gatilhos reais da pessoa).
- Empacotar como app Android (TWA/Capacitor) se a agenda não bastar como lembrete.

## Depois
- Sincronização opcional entre aparelhos (exige decisão sobre dados fora do celular).
- ~~Recompensas~~: recusadas pelo autor; dinheiro mantido só como informação.

## Feito
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

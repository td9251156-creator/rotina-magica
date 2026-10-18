# Visão de produto — Rotina Mágica

Ciclo 0 · 2026-10-16. Documento vivo: atualizar quando uma decisão mudar.

## Conceito atual (2026-10-16, decidido por Claude a pedido do autor) — vale sobre o resto
O autor recusou as direções propostas e pediu: "desenvolva um ótimo app inovador que realmente ajude, faça tudo
sozinho". O conceito escolhido junta o desenho acordado abaixo em duas ideias:

1. **O eu calmo prepara o eu com vontade.** O treino diário (3 min, uma técnica: se-então, surfar a onda, o filme até
   o fim, responder ao pensamento permissivo, futuro em 6 meses, dificultar o acesso, fome/cansaço/solidão) não é
   aula: cada treino escreve uma frase que vira o kit do SOS. Na crise, a pessoa lê as próprias palavras.
2. **A noite como experimento.** Cada noite tem um plano; no dia seguinte, 10 s para dizer como foi (e se bebeu).
   O SOS aprende quais ações fazem a vontade passar (média Beta(1,1), testadas primeiro as promissoras). O
   "laboratório" mostra o que funcionou para a pessoa: planos com mais noites sem uso, dia da semana mais pesado,
   álcool vs. uso, o que veio antes das recaídas. Conselho pessoal com dados próprios, não genérico.

Inovação em relação aos apps existentes: o conteúdo de crise é criado pela própria pessoa fora da crise; a
ordem do SOS é personalizada por resultado; o progresso é um laboratório (n-de-1), não um contador; a tela
inicial muda com a hora (manhã: como foi a noite; saída: decida a noite; madrugada: SOS); depois de usar,
o app cuida (36 h) e transforma o episódio em UM ajuste concreto, sem zerar nada.

**Revisão com jogos (2026-10-16):** o app foi testado e achado pouco interativo. O tédio é o gatilho principal da persona, então o app
tem que ser o oposto do tédio. Agora o centro são 4 jogos curtos, cada um treinando uma habilidade com base em
evidência: **Blocos** (Tetris: 3 min reduzem a força da fissura, Skorka-Brown et al. 2014/2015), **Desvia** (treino
de aproximação/esquiva e controle inibitório: menos recaída em álcool, Wiers 2011/Eberl 2013; inicial em cocaína),
**Rebate** (reestruturação de pensamentos permissivos, TCC/Marlatt; usa as respostas que a pessoa escreveu) e **Segura a
onda** (respiração com expiração longa). (Desvia e Rebate saíram em 2026-10-18, a pedido do autor; ficaram Blocos, Pares, Arcanos, Segura a onda e A noite.) XP e nível só crescem; missão diária com jogo do dia, treino de mente e plano
da noite. O SOS começa por jogar e pede nota da vontade antes e depois: o laboratório mostra o que baixa a vontade
da pessoa, com os dados dela. Isso nenhum app de recuperação faz.

**Privacidade e ensaio (2026-10-16):** PIN opcional (hash PBKDF2), backup cifrado com senha (AES-GCM) e SOS que abre
sem PIN escondendo o que a pessoa escreveu. Quinto jogo, **A noite**: história com escolhas das 18h até dormir, que usa o
plano da pessoa nas opções e mostra onde a vontade mais subiu (ensaio comportamental). Modo demonstração (`?demo`) com
dados de exemplo só na memória, para mostrar o app sem expor dados reais.

Limite de PWA resolvido: lembrete da saída via evento de agenda (.ics) com alarme e link, título discreto.

## Desenho acordado com o autor (2026-10-16)
Construído em conversa, parte por parte. Onde as seções abaixo divergirem, vale isto.

**Problemas que os outros apps não resolvem:** servem só para quem já parou; esperam ser abertos
(na fissura ninguém abre app; a decisão costuma acontecer antes, no fim do expediente); pedem força de
vontade no pior momento.

**Ideia central:** o "eu calmo" decide antes pelo "eu com vontade". O app chega antes da fissura.

**Base de evidência escolhida:** recompensas (manejo de contingência) têm a melhor evidência, mas o autor
**recusou**; o dinheiro economizado aparece só como informação. O centro passa a ser **tornar a noite
mais interessante que a droga** (reforço comunitário, CRA) + **treino diário de técnicas** (3–5 min):
surfar a fissura, adiar 20 min, rodar o filme até o fim, responder a pensamentos permissivos,
"se… então…", cortar acesso, pensar no futuro (evidência inicial), jogo de afastar (evidência inicial).
Fontes: [JAMA Netw Open 2021](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2779686),
[PLOS Medicine 2018](https://journals.plos.org/plosmedicine/article?id=10.1371%2Fjournal.pmed.1002715).

**Dia comum:**
1. Fim do expediente: "Como vai ser sua noite?" → escolhe um plano de noite montado antes.
2. Treino de 3 min, uma técnica por dia.
3. Se a vontade vier: SOS abre direto na técnica que mais funcionou para ele.
4. Dia seguinte: 10 s para dizer como foi a noite e o que ajudou (é isso que personaliza o app).

**Quando der errado:** registro de uso com 1 toque, sem sermão → "modo ressaca" no dia seguinte (comer,
água, dormir, não se cobrar; CVV visível) → depois, 3 perguntas sobre o que veio antes e **um** ajuste
no plano da noite → nada zera.

**Ordem de construção:** (1) primeiro uso + planos de noite, (2) aviso no fim do expediente,
(3) treino diário, (4) SOS personalizado, (5) modo ressaca e ajuste pós-uso.

## 0. Persona de referência (anônima, 2026-10-16)
- Ainda não parou. → O app precisa servir antes do Dia D (registrar, entender padrões, preparar o plano)
  e o Dia D é opcional. Progresso conta a partir do primeiro uso.
- Usa depois do trabalho; gatilhos: ficar sozinho e entediado. → Prioridade é a janela pós-expediente:
  lembrete no fim do expediente, plano de noite concreto, SOS com ações que mudam ambiente e tiram do isolamento.
- Sem pessoa de apoio e sem acompanhamento. → O SOS não pode depender de "ligar para alguém"; CVV fica
  sempre visível. **Alerta específico:** sem ninguém para verificar, as recompensas (manejo de contingência)
  perdem boa parte do efeito, e o isolamento é o próprio gatilho. Vale considerar um CAPS AD (gratuito, SUS,
  sem encaminhamento) como "pessoa"; o app pode ajudar a encontrar o mais próximo.
- Quer modo discreto. → Nome "Rumo" na tela inicial, notificações neutras.
- Não sabe quantos lembretes tolera. → Começa com 1 por dia, no fim do expediente.

## 1. O que a evidência diz (dependência de estimulantes)

Resumo prático, com o que cada achado muda no app. Referências no fim; quando digo "inferido",
é extrapolação minha, não resultado de estudo.

| Abordagem | Força da evidência | O que vira no app |
|---|---|---|
| **Manejo de contingência (CM)**: recompensas concretas e imediatas por abstinência verificada | A mais forte para cocaína/estimulantes; em meta-análises em rede, CM (sozinho ou com CRA) é a intervenção psicossocial com maior efeito | Recompensas que você define e libera por dias sem uso. **Alerta honesto:** sem verificação (exame, pessoa de confiança) o efeito cai muito. Por isso a pessoa verificadora opcional existe no roadmap |
| **TCC / prevenção de recaída (Marlatt)**: identificar situações de risco, treinar enfrentamento, analisar lapsos | Boa; base dos programas digitais validados (CBT4CBT, reSET) | Plano pessoal, registro de fissura com "o que funcionou", análise em cadeia após lapso, micro-lições |
| **Abordagem de reforço comunitário (CRA)**: tornar a vida sem droga mais recompensadora (atividades, relações, trabalho) | Boa, especialmente combinada com CM | Lista de atividades prazerosas no SOS e no planejamento das "horas vazias" |
| **TCC digital (CBT4CBT, reSET)** | RCTs positivos para cocaína como complemento ao tratamento; reSET teve autorização da FDA | Mostra que conteúdo curto e interativo funciona; formato de 3–5 min por lição |
| **Mindfulness para prevenção de recaída / urge surfing** | Moderada | "Surfar a onda": a fissura sobe, atinge pico e passa (em geral em minutos, não horas). Timer + respiração no SOS |
| **Intenções de implementação ("se X, então Y")** | Boa em mudança de comportamento em geral; aplicação a drogas é inferida | Plano escrito em formato se/então, mostrado no SOS no momento certo |
| **Controle de estímulos**: remover acesso (contatos, dinheiro em espécie, rotas) | Componente clássico de TCC | Checklist "barreiras" no plano: apagar contato, limite de saque, rotas evitadas |
| **Exercício físico** | Modesta a moderada para fissura e humor | Opção rápida no SOS (caminhada de 10 min) e no check-in |
| **Avaliação momentânea (EMA)**: estresse, sono, álcool e pistas predizem fissura e uso | Consistente em estudos observacionais | Check-in curto e registro de fissura alimentam os padrões |
| **Medicamentos** | Nenhum aprovado especificamente para cocaína | Fora do escopo do app; vale conversar com médico |

### Alertas específicos que mudam decisões
- **Álcool é um dos gatilhos mais fortes para cocaína** (e a combinação forma cocaetileno, mais tóxico).
  O check-in pergunta sobre álcool desde o início e os insights cruzam isso.
- **Os dias depois do uso ("bad", crash)** trazem humor muito baixo e, em algumas pessoas, pensamentos
  suicidas. O fluxo pós-recaída não pode ser frio: tem acolhimento, cuidado básico (dormir, comer,
  hidratar) e acesso visível ao CVV (188) e SAMU (192).
- **Efeito de violação da abstinência**: quem vê "0 dias" depois de um lapso tende a desistir ("já estraguei
  tudo"). Por isso o progresso nunca zera.

## 2. O que os apps de recuperação erram (e como evitamos)

| Erro comum | Nossa resposta |
|---|---|
| Contador de dias que volta a zero | Dias sem uso **acumulados**, % de dias limpos no mês, maior sequência como recorde (não como placar) |
| SOS escondido atrás de menus e carregamento | SOS a 1 toque da tela inicial do app e a 2 toques da tela inicial do Android (widget/atalho), abre instantâneo |
| Diário longo que vira obrigação e é abandonado | Check-in de 30 s com toques; texto sempre opcional |
| Excesso de notificações genéricas | Poucas, adaptadas aos seus horários de risco, desliga fácil; app recua sozinho se você ignora |
| Conteúdo genérico, motivacional e moralista | Conteúdo seu (suas razões, sua voz, suas fotos) e técnicas com evidência |
| Gamificação vazia (medalhas por abrir o app) | Recompensas reais definidas por você, ligadas a dias sem uso |
| Privacidade fraca: nome do app, notificações reveladoras, dados na nuvem | Dados locais, bloqueio por PIN/biometria, nome/ícone discretos opcionais, notificações neutras |
| Silêncio depois da recaída (quando a pessoa mais precisa) | Fluxo próprio de lapso: acolher, entender a cadeia, ajustar o plano, seguir |
| Onboarding enorme antes de ajudar | SOS funciona no primeiro minuto com conteúdo padrão; personalização acontece aos poucos |

## 3. Visão completa

Princípio: **o app precisa ser útil nos 5 piores minutos do dia e agradável nos outros 1435.**

1. **SOS (crise de fissura)** — tela única, rolável, nesta ordem:
   onda da fissura (timer de 15–20 min com respiração guiada e intensidade antes/depois) → minhas razões
   (texto, foto, áudio gravado por mim) → ligar/mandar mensagem para minha pessoa → meu plano "se… então…"
   → distrações rápidas → se estiver em risco: CVV 188, SAMU 192, CAPS AD mais próximo.
2. **Meu plano** (prevenção de recaída + segurança): gatilhos, sinais de alerta, estratégias que funcionam,
   pessoas, barreiras de acesso, razões para parar, horários de risco.
3. **Check-in diário (30 s)**: humor, fissura 0–10, sono, álcool, estresse, usou hoje (sim/não, sem julgamento).
4. **Registro de fissura (3 toques)**: intensidade, contexto/gatilho, o que fiz, resultado. Também nasce do SOS.
5. **Progresso sem culpa**: dias sem uso acumulados, % de dias limpos, dinheiro e horas recuperados,
   fissuras superadas (cada uma conta como vitória).
6. **Lapso/recaída**: acolhimento → cuidado imediato → análise em cadeia (o que veio antes) → um ajuste no plano.
7. **Padrões e insights locais**: "suas fissuras se concentram sexta 18–23h", "dias com álcool têm 3× mais fissura".
8. **Habilidades**: micro-lições de 3–5 min (recusar oferta, pensamentos permissivos, resolver problemas,
   planejar fins de semana), com prática registrada.
9. **Recompensas**: metas por dias sem uso com recompensa que você escolhe; poupança virtual do dinheiro
   não gasto; pessoa verificadora opcional para aproximar do CM real.
10. **Lembretes inteligentes**: check-in diário, alerta antes do horário de risco, celebração de marcos; adaptativos.
11. **Privacidade**: bloqueio, modo discreto, exportação/backup criptografado; pronto para publicar.

## 4. MVP priorizado

| # | Entrega | Por que nesta ordem |
|---|---|---|
| 1 | Esqueleto técnico (hoje PWA no GitHub Pages; repositórios, CI) | Base que evita retrabalho e permite testar no celular desde o ciclo 2 |
| 2 | **SOS + Meu plano** | Maior impacto no momento de maior risco; funciona mesmo sem histórico |
| 3 | Check-in diário + registro de fissura | Gera os dados que alimentam progresso e padrões; reforça automonitoramento |
| 4 | Progresso sem culpa + fluxo de lapso | Mantém você usando o app justamente quando mais importa |
| 5 | Lembretes, widget/atalho de SOS, bloqueio e modo discreto | Leva o SOS para a tela inicial; protege a privacidade antes do uso diário real |

Fica fora do MVP: insights, lições, recompensas, backup. Entram logo depois, em ciclos próprios.

## 5. Plataforma

**Atual (2026-10-16): PWA (Vite + React + TypeScript) no GitHub Pages.** O autor não quer Expo Go nem
ferramentas de desenvolvimento no celular: abre por um link e instala na tela inicial.

O que o PWA entrega: abre por link, instala com ícone "Rumo", funciona offline (service worker), atalho
"Agora" no toque longo do ícone para o SOS, dados no próprio aparelho.

O que perde em relação a um app nativo (Expo), e como contornar:
| Limitação | Contorno |
|---|---|
| Notificação agendada offline (aviso no fim do expediente) não é confiável no Android | Lembrete recorrente no relógio/agenda do celular com link para o app; ou empacotar como TWA/Capacitor depois |
| Sem widget na tela inicial | Atalho "Agora" no ícone; ícone na primeira tela |
| Navegador pode limpar dados se faltar espaço | `navigator.storage.persist()` e, depois, backup manual exportável |

Se essas limitações pesarem no uso real, o mesmo código React vira app Android com Capacitor ou TWA,
sem reescrever as regras e os repositórios.

## 6. GitHub Student Developer Pack

Conferido no site oficial em 2026-10-16. Em uso, sem custo: GitHub Pro, Pages, Copilot (plano Student, com
`.github/copilot-instructions.md`) e Codespaces (`.devcontainer/`). Domínio, 1Password e testes em aparelhos ficam para
decisão do autor porque cobram depois do período grátis. Sentry e serviços de nuvem recusados (mandam dados para fora).
Como ativar cada um e o custo depois: [`student-pack.md`](student-pack.md).

## 7. Riscos de uso real já endereçados no desenho
- **Abandono**: check-in curtíssimo, app útil sem preencher nada, notificações que recuam se ignoradas.
- **Culpa pós-recaída**: progresso não zera, fluxo de lapso acolhedor, linguagem revisada.
- **Fadiga de notificação**: máximo de 1–2 por dia por padrão, você escolhe horários.
- **Uso em crise**: SOS instantâneo, botões grandes, pouco texto, funciona offline e com tela bloqueada via widget.
- **Privacidade**: tudo local, bloqueio, modo discreto, nenhum dado sai do aparelho.

## Referências principais
- De Crescenzo F. et al. *Comparative efficacy and acceptability of psychosocial interventions for individuals with cocaine and amphetamine addiction: a systematic review and network meta-analysis.* PLoS Medicine, 2018.
- Brown H. D., DeFulio A. *Contingency management for the treatment of methamphetamine use disorder: a systematic review.* Drug and Alcohol Dependence, 2020.
- Carroll K. M. et al. *Computer-assisted delivery of cognitive behavioral therapy (CBT4CBT) for cocaine dependence.* Am J Psychiatry, 2014.
- Campbell A. N. C. et al. *Internet-delivered treatment for substance abuse: a multisite randomized controlled trial (Therapeutic Education System).* Am J Psychiatry, 2014 — base do reSET.
- Marlatt G. A., Donovan D. M. *Relapse Prevention.* 2ª ed., Guilford, 2005.
- Bowen S. et al. *Relative efficacy of mindfulness-based relapse prevention, standard relapse prevention, and treatment as usual.* JAMA Psychiatry, 2014.
- Stanley B., Brown G. K. *Safety Planning Intervention.* Cognitive and Behavioral Practice, 2012.
- Gollwitzer P. M., Sheeran P. *Implementation intentions and goal achievement: a meta-analysis.* Adv Exp Soc Psychol, 2006.

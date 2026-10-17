# CLAUDE.md — Rotina Mágica

Guia para quem (humano ou IA) trabalha neste repositório. Mantenha atualizado a cada ciclo.

## O que é
App de código aberto (MIT; web instalável, usado no Android) para ajudar a parar de usar cocaína: SOS de fissura, plano de prevenção de recaída,
check-in diário, registro de fissuras e progresso sem culpa. Desenhado em volta de uma persona de referência anônima (ver a visão).
Visão completa e evidências: [`docs/visao-produto.md`](docs/visao-produto.md). Andamento: [`ROADMAP.md`](ROADMAP.md).

## Critério de decisão
"Isso ajuda uma pessoa em recuperação, com evidência de que funciona?" Se não há evidência, a feature
precisa ser barata, opcional e não atrapalhar o fluxo de crise.

## Decisões tomadas
| Data | Decisão | Por quê |
|---|---|---|
| 2026-10-16 | Dados 100% locais, sem conta nem nuvem por enquanto | Privacidade; uso pessoal |
| 2026-10-16 | ~~Expo (React Native)~~ substituído no mesmo dia | O autor não quer Expo Go nem ferramentas de dev no celular |
| 2026-10-16 | ~~SQLite + Drizzle~~ substituído no mesmo dia | Ver PWA abaixo |
| 2026-10-16 | Progresso nunca "zera" | Evita o efeito de violação da abstinência (Marlatt): recaída vira dado, não fracasso |
| 2026-10-16 | Português (pt-BR) na UI, nos docs e nos commits | Consistência |
| 2026-10-16 | ~~Nome "Rumo"~~ trocado por "Rotina Mágica" (tela inicial e app); pacote `dev.recomeco.app` | Pedido do autor: "retomar o controle da vida". Lembretes da agenda seguem discretos ("Rotina: …") |
| 2026-10-16 | Progresso começa a contar no primeiro uso do app (`trackingStartDate`) | Serve também a quem ainda não parou; o Dia D é opcional |
| 2026-10-16 | PWA (Vite + React + TypeScript) publicado no GitHub Pages | Abre por um link e instala na tela inicial ("Adicionar à tela inicial"), sem loja nem Expo Go. Funciona offline via service worker |
| 2026-10-16 | Dados no `localStorage` do navegador, acesso só via repositórios (`repositories/types.ts`) | Simples e síncrono; o site é público mas os dados nunca saem do celular. Trocar por IndexedDB/sync/criptografia só implementa as mesmas interfaces |
| 2026-10-16 | Conceito: "a noite como experimento" + "o eu calmo prepara o eu com vontade" | O autor pediu que Claude decidisse tudo. Treino diário gera o kit do SOS; SOS aprende o que funciona (Beta(1,1)); laboratório mostra o que funcionou com os dados da pessoa. Ver `docs/visao-produto.md` |
| 2026-10-16 | Jogos no centro do app (Blocos, Desvia, Rebate, Segura a onda) + XP/nível que só cresce + missão diária | O autor achou o app pouco interativo. Cada jogo tem base: Tetris baixa fissura (Skorka-Brown 2014/15), treino de esquiva (AAT, Wiers/Eberl), reestruturação cognitiva, respiração lenta. XP mede prática, não abstinência (recompensas por abstinência seguem recusadas) |
| 2026-10-16 | SOS começa por jogar, com nota da vontade antes/depois | Na fissura ninguém lê texto; jogar é fazível. As notas mostram, com os dados da própria pessoa, o que baixa a vontade |
| 2026-10-16 | Lembrete do fim do expediente via evento de agenda (.ics) com alarme e link | PWA não agenda notificação offline; a agenda do Android é confiável e não envia dados para fora |
| 2026-10-16 | PIN opcional (hash PBKDF2) e backup cifrado (AES-GCM), tudo com Web Crypto no aparelho | Discrição se alguém pegar o celular. O SOS abre sem PIN e esconde o que a pessoa escreveu; backup não traz o PIN de volta |
| 2026-10-16 | Modo demonstração `?demo`: dados de exemplo só na memória | Mostrar o app (jurados, profissionais) sem expor nem tocar nos dados reais |
| 2026-10-16 | Student Pack: só o que é grátis e não manda dados para fora (Pro, Pages, Copilot, Codespaces) | Domínio, 1Password e testes em aparelhos cobram depois: decisão do autor. Ver `docs/student-pack.md` |
| 2026-10-16 | App refeito em volta de uma "rotina mágica" (prática diária com ritual): abas Rotina / Arsenal / Diário / Ajustes, visual noturno com dourado e títulos com serifa (inspirado no Lições do Dia) | Pedido do autor: "comece do zero". A prática espiritual é da pessoa; o app organiza, guia com tempo e registra. Base comportamental: rotina estruturada, respiração lenta, imagem mental, automonitoramento |
| 2026-10-16 | Juramento editável, sem "sangue" nem maldição; elástico só como "estalo leve, sem machucar" | Autoagressão e autopunição pioram recaída (efeito de violação da abstinência) |
| 2026-10-16 | Linguagem simples, sem jargão; abas Hoje / Ajuda agora / Diário / Ajustes; nomes mágicos só como detalhe ("Luz pelo corpo" explica o Pilar do Meio) | Pedido do autor: texto próximo do público, com abordagem de psicologia |
| 2026-10-16 | Cores exatas do Lições do Dia (paleta "Noite" do Templo, repo `licoes-do-dia`, `docs/templo/templo.css`): fundo #0e1017, dourado #c9a45c, títulos #f1e6cf, céu estrelado | Pedido do autor: mesmo visual do outro app |
| 2026-10-16 | "Desatar um pensamento": registro de pensamentos da TCC em 4 degraus (corpo, emoção, pensamento + armadilhas, resposta) | Arquivo HABIL (modelo de subir a Árvore + distorções de Burns); TCC tem forte evidência em dependência de cocaína. Inclui a "permissão" ("só hoje, eu mereço") |
| 2026-10-17 | Código aberto (MIT) com CONTRIBUTING, código de conduta, SECURITY e modelos de issue/PR; nome pessoal removido dos docs | Pedido do autor. Repositório público `rotina-magica`, criado só com o estado atual, sem histórico pessoal. Site: https://td9251156-creator.github.io/rotina-magica/ (mesma origem do endereço antigo, então os dados do celular continuam) |
| 2026-10-17 | "Clima de hoje": previsão de risco por dia da semana, hora de pico e gatilho, só com dados do aparelho | Prevenção de recaída começa por prever a situação de risco (Marlatt). Precisa de ≥3 registros; antes disso mostra "aprendendo" |
| 2026-10-17 | Rotina com ou sem ritual (`routineStyle`), mesmos ids de passo | Para servir a quem não pratica magia sem perder o histórico; versão laica usa luz da manhã, intenção do dia, relaxamento muscular progressivo |
| 2026-10-17 | Carta do eu calmo (`letter`) abre primeiro em Ajuda agora; escondida com PIN | Pensamento de futuro e "o eu calmo prepara o eu com vontade"; na crise, a voz da própria pessoa |
| 2026-10-17 | Tema claro (papel quente do Lições do Dia) seguindo o celular, com escolha em Ajustes; práticas guiadas sempre noturnas | Acessibilidade e leitura de dia; igual ao Templo |
| 2026-10-17 | Integrações externas só opcionais e sem dados da pessoa; preferência por gerar no computador do mantenedor e publicar como arquivo estático (ex.: voz narrada). Avaliação em `docs/integracoes.md` | Mantém dados 100% locais e a ajuda offline, e ainda abre espaço para voz e IA generativa sem expor ninguém |
| 2026-10-17 | Comunidade: issues "good first issue" e "help wanted", issues e PRs aceitos em inglês, Dependabot mensal (npm e Actions, sem versões major) | Atrair contribuidores externos e manter o projeto ativo para programas de código aberto. Commits dos mantenedores seguem em português |
| 2026-10-17 | Rodada de visual: Ajustes em itens que abrem e fecham (com o essencial no título), passo da rotina num cartão só, barra de progresso por período, ferramentas em grade 2×2, botão "Instalar" do próprio app (`installDismissed`), "Falar com alguém agora" no topo da Ajuda agora e nomes simples nas técnicas | Pedido do autor: mais bonito, fácil e prático. Menos rolagem e alvos de toque ≥44 px; instalar dá o atalho "Agora" de 2 toques |
| 2026-10-17 | "Terapias e vivências" (`#treino`): exercícios agrupados por abordagem com evidência em dependência (entrevista motivacional, TCC e prevenção de recaída, atenção plena/MBRP, ACT, rede de apoio), cada uma com o nome da terapia e a base. Feito em partes; a parte 1 trouxe balança da decisão, régua de 0 a 10, escolhas que parecem inocentes, autocompaixão (`gentileza`), ver o pensamento de fora, revisão da noite, rede de apoio (`pessoa`, aparece no SOS) e "Parar e respirar" (SOBER, 3 min) | Pedido do autor. Dos guias de magia que ele mandou, entrou só o que conversa com o tratamento (revisão da noite, constância, não usar a prática para fugir de problemas); ficaram fora corte com sangue, transe e projeção astral. Manejo de contingências segue fora (recompensas recusadas) |
| 2026-10-17 | Jogos refeitos em partes, um jogo bem feito por rodada. Parte 1: "Pares" (paciência estilo Mahjong, `domain/games/mahjong.ts`), sempre com solução (montado ao contrário), dica, embaralhar e desfazer. Cartão "Ajuda de gente" saiu do laboratório e das vivências | Pedido do autor: jogos que prendam e estimulem o cérebro (Tetris, Mahjong). Atenção sustentada e memória de trabalho ocupam o espaço da vontade, como o Tetris (Skorka-Brown) |
| 2026-10-17 | Jogos, parte 2: Blocos com guardar peça, 3 próximas, combo, bônus de quatro linhas seguidas, pausa e meio segundo de ajuste antes de travar. Fora do SOS, o "Ajuda de gente" virou só "CVV 188" no rodapé de Ajustes (contatos de crise do SOS seguem) | Pedido do autor: jogo que prenda como um Tetris de verdade; e tirar o cartão de ajuda, mantendo o CVV discreto |
| 2026-10-17 | Símbolos do ocultismo nos jogos (`gameSymbols`, segue `routineStyle` até a pessoa escolher): Pares com planetas e signos nas cores dos elementos, Blocos sobe a Árvore da Vida (um nível por esfera, de Malkuth a Kether) e jogo novo "Arcanos" (memória com os 22 Arcanos Maiores, correspondências da Golden Dawn, cada par traz uma ideia para a vida, sem adivinhação). Arcanos só aparece com os símbolos ligados | Pedido do autor. Memória de trabalho ocupada baixa a fissura (Kavanagh, intrusão elaborada). Desenhos ficam em `features/games/art.ts`, gerados por outra IA com `docs/prompt-simbolos.md` e conferidos por `art.test.ts` (só formas, sem script nem cor fixa) |
| 2026-10-17 | Desenhos feitos por outra IA, com a lógica aqui: ícones do app em `src/ui/app-icons.ts` (por sentido: `aba_*`, `passo_*`, `ferr_*`, `sos_*`, `ter_*`, `jogo_*` e gerais), símbolos dos jogos em `features/games/art.ts` e logo em `public/icons/logo.svg` (gera os PNG do manifest). Prompts em `docs/prompt-icones.md` e `docs/prompt-simbolos.md`; `src/ui/svg-check.ts` recusa script, eventos e cor fixa | Pedido do autor: "faça a lógica, deixe o visual simples e um prompt para outra IA criar os símbolos" |
| 2026-10-17 | Terapias e vivências, parte 2: "Parar e respirar" também na Ajuda agora; notas da régua de 0 a 10 guardadas no treino (`Practice.scores`, opcional: registros antigos seguem válidos) e mostradas no laboratório; as "coisas boas" da revisão da noite viram a vitória do Diário do dia; uma "escolha que parece inocente" (`sinal_alerta`) aparece no Clima de hoje | Pedido do autor. Ver a confiança subir reforça a autoeficácia (entrevista motivacional); notar sinais cedo é o centro da prevenção de recaída (Marlatt) |
| 2026-10-17 | Terapias e vivências, parte 3: grupo da família (CRAFT; Nar-Anon e Amor-Exigente para familiares) com conversa sem briga, texto pronto para mandar (`TechniqueStep.share`, sai do celular só pelo toque da pessoa) e combinados; modo "dia difícil" (`hardDay` guarda a data: só vale naquele dia; `ESSENTIAL_STEP_IDS` = compromisso, se a vontade aparecer, diário e fechar o dia) | Pedido do autor. Envolver a família ajuda a buscar e manter o tratamento (Meyers e Smith); num dia ruim, manter o fio da rotina com pouco esforço evita o "já que estraguei, tanto faz" |
| 2026-10-17 | Apoio financeiro só por doação voluntária (GitHub Sponsors primeiro; Pix aleatório, Ko-fi ou Apoia.se depois; editais de saúde e da universidade). Sem versão paga, anúncio nem pedido de dinheiro na Ajuda agora. Avaliação em `docs/apoio-financeiro.md`; GitHub Sponsors ligado pelo autor; `.github/FUNDING.yml` e seção "Apoie" no README (outras contas entram no FUNDING.yml quando existirem) | Pedido do autor. Cobrar quem está em recuperação vai contra o critério do projeto; contas e dados bancários são ação dele |
| 2026-10-17 | Voz nas práticas guiadas com a voz do próprio celular (Web Speech, `platform/voice.ts`), em frases curtas com silêncio entre elas (`voiceScript`: 0,9 s na vírgula, 2,2 s no ponto, ritmo medido num áudio de meditação guiada que o autor mandou como referência), opcional e desligada por padrão (`practiceVoice`); sem suporte, o botão some | Na vontade, ler é difícil e de olhos fechados não dá; a síntese do aparelho não manda dados para fora. Desligada por padrão porque a pessoa pode estar em lugar público |
| 2026-10-16 | Padrão de lembretes: 1 por dia, no fim do expediente | Maior risco é depois do trabalho, sozinho e entediado; a persona não soube dizer quantos tolera |

## Arquitetura
```
index.html, src/main.tsx   entrada; registra o service worker (só em produção)
src/App.tsx, src/router.ts navegação por hash + TabBar: '' (Hoje), #sos (Ajuda agora), #diario, #ajustes, #rotina/<passo>, #pensamento, #jogos[/id], #usei[/entender], #treino[/id], #lab, #ajustes, #primeiro-uso
src/domain/routine.ts      a rotina (Manhã/Tarde/Noite), práticas guiadas (fases com tempo), compromisso padrão
src/domain/thinking.ts     armadilhas do pensamento (TCC), dicas do corpo, contagem
src/domain/forecast.ts     Clima de hoje: previsão de risco com os dados do aparelho
src/domain/training.ts     exercícios (técnicas em passos); therapies.ts agrupa por terapia, com a base de cada uma
src/domain/games/          motores puros dos jogos (blocos, mahjong=Pares, memory=Arcanos, symbols=planetas/signos/Árvore/tarô, swipe=Desvia, rebate, wave=Segura a onda, story=A noite) e rng com semente
src/features/<x>/          telas, componentes e testes de cada funcionalidade
src/domain/                regras puras (sem React, sem armazenamento), 100% testável
src/data/                  repositories/types.ts (interfaces), repositories/local.ts (localStorage),
                           provider.tsx (contexto useData), test-repos.ts (repositórios em memória p/ testes)
src/platform/crypto.ts     PIN (PBKDF2) e cifra do backup (AES-GCM), via Web Crypto
src/data/backup.ts, demo.ts backup com senha; dados de exemplo do modo ?demo
src/ui/                    estilos (styles.css, tema noite e claro por variáveis), ícones (app-icons.ts + Icon em icons.tsx) e componentes compartilhados (Setting = ajuste que abre e fecha)
src/platform/install.ts    botão Instalar (guarda o beforeinstallprompt do Chrome); voice.ts = voz das práticas
public/                    manifest.webmanifest, sw.js (offline), ícones
.github/workflows/         ci.yml (PR) e pages.yml (publica a cada push na main); .github/dependabot.yml (mensal)
docs/                      visao-produto.md, integracoes.md (regras para serviços externos), apoio-financeiro.md, student-pack.md, img/ do README
.devcontainer/, .github/copilot-instructions.md   Codespaces e Copilot (Student Pack)
```
Regras:
- UI nunca mexe no `localStorage` direto; usa `useData()` (`repos` para ler, `write()` para gravar e re-renderizar).
- Toda entidade tem `id` (UUID), `createdAt`, `updatedAt` e `deletedAt` (exclusão lógica), para permitir sync depois.
- Regras de domínio (progresso, planos de noite, horários) são funções puras com testes.
- SOS: abre sem depender de dados, do primeiro uso nem do PIN (com PIN, esconde o kit). Do Android: segurar o ícone do app → "Agora" (atalho do manifest) = 2 toques.
- Dado corrompido nunca trava o app: `local.ts` guarda uma cópia e recomeça.

## Convenções
- Commits pequenos, em português, imperativo: `adiciona tela de SOS`, `corrige cálculo de dias`.
- Branches: `claude/...` para trabalho da IA; PR para `main`. Merge na `main` publica no Pages.
- Testes: Vitest + jsdom + Testing Library (`npm test`). Obrigatórios em `src/domain` e `src/data`;
  fluxos principais testados em `src/App.test.tsx`.
- Mudou a forma dos dados guardados? Mantenha leitura do formato antigo em `local.ts` (o celular já tem dados).
- Mudou arquivos do app? Suba `CACHE` em `public/sw.js` só se mudar a lista de arquivos fixos; o resto se atualiza sozinho.
- Texto do app: direto, acolhedor, sem moralismo, sem "você falhou". Nunca culpar.
- Notificações: texto discreto (não mencionar droga/recaída na tela bloqueada).
- Web não tem notificação agendada confiável offline no Android; lembretes dependem de alternativa (ver ROADMAP).

## Nunca
- Commitar dados pessoais, chaves, keystore, `.env` (já no `.gitignore`).
- Enviar dados para fora do aparelho (analytics, crash reporting) sem decisão explícita registrada aqui.

## Como rodar
No celular: abrir o link do GitHub Pages no Chrome → menu ⋮ → "Adicionar à tela inicial" (ou "Instalar app").

No PC (Node.js 22 LTS):
```bash
npm install
npm run dev             # abre em http://localhost:5173 (e no IP da rede, para testar no celular)
npm test                # testes
npm run typecheck       # TypeScript
npm run build           # gera dist/ (o que vai para o Pages)
```

### GitHub Pages
- Workflow `pages.yml` publica a cada push na `main`. Em Settings → Pages, Source deve ser "GitHub Actions".
- Repositório privado com Pages exige GitHub Pro (vem no Student Pack). O site fica público, mas é só o app:
  os dados de cada pessoa ficam no próprio celular. `noindex` evita buscadores.

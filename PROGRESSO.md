# Progresso — Rotina Mágica

## Feito

- Leitura inicial de `CLAUDE.md`, `ROADMAP.md` e `README.md`.
- Pares ganhou o tabuleiro intermediário Jardim, com 44 peças.
- Pares ganhou um desafio diário opcional, reproduzível pela data local e sem ranking ou cobrança.
- Desvia passou a limpar um gesto cancelado pelo navegador e a anunciar a carta para leitores de tela.
- Rebate passou a evitar alternativas duplicadas quando a resposta pessoal coincide com uma armadilha.
- Segura a onda passou a capturar o ponteiro e tratar cancelamento sem encerrar o ciclo ao sair visualmente do botão.
- Práticas passaram a aceitar MP3s narrados estáticos opcionais, com fallback para a voz local quando o arquivo não existe.
- O Laboratório passou a cruzar notas de vontade do Diário com noites sem usar ou com uso, só quando há dados suficientes.
- Ajustes passou a oferecer um segundo lembrete opcional da manhã, em arquivo de agenda separado.
- Terapias e vivências ganhou o grupo “Lidar com a vontade”, com “Surfar a vontade”, “Pensar o filme até o fim” e “Carta para mim de amanhã”; os passos usam a preferência de voz guiada existente.
- A voz das práticas segue o ritmo dos três áudios de referência: falas curtas pela fase inteira, nomes vibrados, voz masculina quando houver e "Som de fundo" opcional. O roteiro para gravar a narração está em `docs/roteiro-narracao.md`.
- Narração com voz neural (Kokoro, voz masculina) gerada para as quatro práticas guiadas e publicada com o app; toca sem internet depois da primeira vez.
- Clima de hoje com lembrete antes da hora de risco (arquivo de agenda nos dias que pedem atenção); narração guardada para tocar sem internet; Laboratório com o texto do "Diário e noites" corrigido; prévia discreta do link.

## Em andamento

- Testar o app completo no celular, no uso real.
- Jogos, parte 4: revisar os outros jogos, um por rodada.
- Trazer contribuidores: issues "good first issue" e "help wanted" abertas.

## Backlog

- Desafios semanais e modos difíceis.
- Ajustar textos e técnicas com o uso real.
- Cenas de A noite que aprendem com o laboratório.
- Empacotar como app Android se a agenda não bastar.

## Decisões

- Dados continuam somente no aparelho; nenhuma alteração adiciona conta, servidor ou analytics.
- O desafio diário usa uma semente derivada da data local; não cria conta, ranking ou envio de dados.
- Gestos cancelados no Desvia não alteram pontuação nem avançam a rodada.
- Respostas personalizadas do Rebate continuam corretas e aparecem em uma lista de três opções distintas.
- Sair visualmente do círculo durante o toque não interrompe a respiração; soltar ou cancelar ainda fecha o gesto.
- Áudio narrado só será usado se o arquivo estático existir; nenhum serviço externo é chamado pelo app.
- O cruzamento Diário/noites mostra associação, não causalidade, e exige dois registros de cada tipo.
- Lembretes extras não são ativados automaticamente: a pessoa baixa e importa o arquivo se quiser.
- A voz dos exercícios reutiliza `practiceVoice`, fica desligada por padrão e não envia texto para fora do aparelho.

## Perguntas em aberto

- Qual formato de desafio diário ajuda sem transformar o jogo em cobrança?

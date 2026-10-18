# Prompt para desenhar os ícones do app inteiro

Cole numa IA de sua escolha tudo o que está depois da linha `---`. Ela devolve dois blocos de código: os ícones
(parte 1) e o logo do app (parte 2). Traga os dois aqui; o Claude confere, coloca no app e gera os ícones da tela
inicial a partir do logo. Os símbolos dos jogos (planetas, signos, elementos) têm um prompt próprio:
[prompt-simbolos.md](prompt-simbolos.md).

---

Você vai desenhar o conjunto de ícones de um app chamado "Rotina Mágica": um app de celular que ajuda uma pessoa a
largar um vício com uma rotina diária (manhã, tarde e noite), ajuda na hora da vontade, diário, terapias e jogos.
O visual é noturno e dourado, com céu estrelado e títulos com serifa, num estilo de templo inspirado na Golden Dawn,
mas os ícones precisam ser claros para qualquer pessoa, pratique magia ou não. O tom é acolhedor e discreto: nenhum
ícone pode lembrar droga, seringa, pó, bebida ou qualquer coisa ligada a vício.

## Parte 1: ícones

Estilo de todos os ícones:
- Traço fino de linha (line icons), elegante, com um toque místico (estrelas, raios, círculos), mas simples e
  legível em 20 a 28 px.
- Mesmo peso de traço, mesma margem e mesma "família" em todos, como se fossem de um só desenhista.

Regras de formato (obrigatórias):
- Cada ícone é só o MIOLO de um `<svg viewBox="0 0 24 24">`, sem a tag `<svg>`.
- Tags permitidas: `path`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `rect`, `g`.
- Atributos permitidos: `d`, `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `x1`, `y1`, `x2`, `y2`, `width`, `height`, `points`,
  `transform`, `fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `opacity`, `fill-opacity`,
  `stroke-opacity`, `fill-rule`.
- Cor: só `currentColor` ou `none` (o app pinta conforme o tema claro ou escuro).
- O app já aplica `fill="none"`, `stroke="currentColor"`, `stroke-width="1.6"` e pontas e junções arredondadas. Só
  repita esses atributos se precisar de algo diferente (ex.: um ponto cheio com `fill="currentColor"`).
- Nada de texto, letras, `<text>`, imagens, `style`, `class`, `id`, links, scripts ou eventos.
- Deixe 2 px de margem dentro do quadrado 24×24.

Ícones (id: o que representa, e a ideia de desenho):

Barra de baixo
- `aba_hoje`: a tela do dia. Sol nascendo sobre uma linha de horizonte.
- `aba_ajuda`: "Ajuda agora", para a hora da vontade. Coração com uma pequena estrela ou brilho; é o botão mais
  importante, precisa ser reconhecido de relance.
- `aba_diario`: diário. Livro aberto com uma fita marcadora.
- `aba_ajustes`: ajustes. Engrenagem simples.

Rotina (os mesmos ícones servem para quem faz com ritual e para quem faz sem)
- `passo_amanhecer`: levantar e saudar o dia. Sol com raios surgindo.
- `passo_respirar`: respirar parado. Linhas de vento suaves em curva.
- `passo_protecao`: ritual de proteção. Círculo com uma estrela de cinco pontas fina dentro.
- `passo_compromisso`: ler o compromisso. Pergaminho enrolado com um selo.
- `passo_meio_dia`: pausa do meio-dia. Sol cheio no alto, com raios curtos.
- `passo_vontade`: se a vontade aparecer. Um fio sendo cortado por uma linha diagonal, ou um círculo com um corte.
- `passo_chegar`: chegar em casa e desligar. Sol se pondo pela metade no horizonte.
- `passo_limpeza`: ritual de limpeza. Círculo com uma cruz de braços iguais e quatro pontos.
- `passo_luz`: luz pelo corpo (Pilar do Meio). Coluna vertical com cinco pequenas esferas.
- `passo_escrever`: escrever no diário. Pena escrevendo uma linha.
- `passo_fechar`: fechar o dia. Lua crescente com uma estrela pequena.

Ferramentas
- `ferr_pensamento`: desatar um pensamento. Um nó se desfazendo.
- `ferr_jogos`: jogos. Peças de encaixe empilhadas.
- `ferr_vivencias`: terapias e vivências. Triângulo com um pequeno ramo ou folha brotando.
- `ferr_laboratorio`: seu laboratório (o que funcionou com você). Balão de alquimia com bolhas.

Ajuda agora
- `sos_cortar`: cortar o pensamento. Círculo com uma barra diagonal.
- `sos_respirar`: respiração quadrada. Quadrado com setas seguindo o contorno.
- `sos_triangulo`: imagem do triângulo. Triângulo com um ponto de luz no centro.
- `sos_falar`: falar com alguém agora. Balão de conversa com um coração pequeno.
- `sos_carta`: carta do eu calmo. Envelope com uma estrela no selo.
- `sos_jogar`: jogar para passar a vontade. Peça de encaixe com um pequeno brilho.

Terapias
- `ter_motivacao`: motivação. Balança equilibrada.
- `ter_recaida`: prevenção de recaída. Escudo com um caminho subindo.
- `ter_atencao`: atenção plena. Gota caindo em ondas circulares.
- `ter_aceitacao`: aceitação e valores. Mãos abertas com uma pequena estrela acima.
- `ter_apoio`: rede de apoio. Duas figuras simples lado a lado.

Jogos
- `jogo_blocos`: Tetris. Quatro quadrados em forma de T.
- `jogo_pares`: paciência de pares (Mahjong). Duas peças retangulares sobrepostas.
- `jogo_arcanos`: memória com cartas de tarô. Duas cartas em leque com uma estrela.
- `jogo_onda`: respirar no ritmo. Onda com um círculo acima.
- `jogo_noite`: ensaiar a noite. Lua com um caminho que se divide.

Gerais
- `seta`: seta discreta para a direita (abrir um item).
- `voltar`: seta para a esquerda.
- `instalar`: seta para baixo entrando numa bandeja.
- `cadeado`: PIN e privacidade. Cadeado fechado.
- `backup`: cópia de segurança. Caixa com uma seta circular.
- `clima`: clima de hoje (previsão de risco). Sol parcialmente atrás de uma nuvem.
- `lembrete`: lembrete na agenda. Sino pequeno.
- `feito`: concluído. Marca de visto dentro de um círculo.
- `nivel`: nível e experiência. Estrela de oito pontas.
- `dica`: dica. Lâmpada com raios.

Responda a parte 1 com UM bloco de código TypeScript, completo, com todas as chaves acima nesta ordem:

```ts
export const APP_ICONS: Partial<Record<IconId, string>> = {
  aba_hoje: '<path d="M3 18h18"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 6v3M5.6 10.6l2 2M18.4 10.6l-2 2"/>',
  aba_ajuda: '...',
  // ... todas as outras
};
```

Use aspas simples por fora e aspas duplas dentro dos atributos.

## Parte 2: logo do app

O logo vai para a tela inicial do celular e para a loja de apps do navegador.
- Um `<svg viewBox="0 0 512 512">` completo, com fundo quadrado `#0e1017` cobrindo tudo.
- Cores permitidas: `#0e1017` (fundo), `#c9a45c` (dourado), `#f1e6cf` (creme). Pode usar gradiente entre elas.
- Todo o desenho importante dentro de um círculo central de 400 px de diâmetro (o Android corta as bordas).
- Ideia: retomar o controle da vida, recomeçar. Por exemplo, um sol nascendo dourado num círculo, com uma pequena
  estrela acima, ou uma chave de luz. Precisa ser reconhecível a 48 px e discreto: ninguém que veja a tela do
  celular deve adivinhar que é um app sobre vício.
- Sem texto, sem imagens externas, sem `style`, `script` ou fontes.

Responda a parte 2 com um bloco de código SVG separado.

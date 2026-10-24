# Identidade visual

A marca usa um sol nascente e um caminho dourado que chega ao horizonte. A estrela de quatro pontas é um detalhe;
o sol e o caminho precisam continuar reconhecíveis quando o ícone é pequeno. Azul noturno, dourado e creme preservam
a identidade discreta do app, sem imagens que revelem seu uso.

## Identidade das telas (2026-10-24)

Hoje, Diário, Pausa agora e Vivências seguem um protótipo de design entregue pelo autor. Três princípios:

1. **Uma coisa por vez.** Cada tela começa com uma pergunta ou ação grande; o resto vem depois, com menos peso.
2. **Ajuda no mesmo lugar.** "Pausa agora" fica no centro da barra (Hoje, Diário, Pausa, Vivências, Ajustes),
   sempre com a mesma cor (`--sos-fill`). As cores `--sos*` só aparecem na pausa.
3. **Luz sem cobrança.** Dourado (`--accent`) marca só o que se toca e o sol. Nunca nota ou falha; dias sem registro
   são neutros (`--line`), sem vermelho.

- **Tokens** no topo de `src/ui/styles.css`: cores (`--sos-fill`, `--sos-soft`, `--line`, `--idle`, `--sel`, `--nav`),
  tipografia em `rem` (`--t-display` 34, `--t-title` 20, `--t-card` 16, `--t-quote` 17 itálico, `--t-body` 16,
  `--t-small` 13, o mínimo), cantos `--r-sm/md/lg/pill` e `--tap` (alvo de toque de 48 px).
- **Literata** (SIL OFL 1.1) para títulos e frases da pessoa; o resto usa a fonte do sistema. Os arquivos ficam em
  `src/ui/fonts/` (latin 400, 600 e 400 itálico) e entram no build; o service worker os guarda pelo manifesto de
  assets, então o app abre igual sem internet. Nada vem do Google Fonts (a CSP só aceita `font-src 'self'`).
- **Humor como sol nascendo** (`.mood-list` + `<span class="sun" style="--i:n">`): a mesma lista no início e no
  Diário. Ninguém escolhe "o sol baixo" como nota; é só a hora do dia. "Sua semana" usa o mesmo sol, acima do
  horizonte nos dias com cuidado.
- **Vivência**: fechar de 48 px, progresso em segmentos, anel da pausa com o sol no centro (em `pausa_corpo` e
  `preparar_sono` o sol cresce e diminui a cada 4 s, parado com "reduzir movimento"), destino de cada campo escrito
  (kit, Diário ou "não fica guardado"), folha "Sair por agora?" e o sol nascendo no fim.

## Arquivos e usos

| Arquivo | Uso |
|---|---|
| `public/icons/logo.svg` | Variante vetorial da marca, com cantos arredondados |
| `public/icons/maskable.svg` | Variante vetorial com fundo completo e símbolo recuado |
| `public/icons/icon-192.png`, `icon-512.png` | Ícones instaláveis exportados da arte do logo |
| `public/icons/maskable-512.png` | Android: fundo opaco de 512 px; arte de 432 px centralizada com margem de 40 px |
| `public/icons/apple-touch-icon.png` | Ícone opaco de 180 px para iPhone/iPad; o sistema aplica os cantos |
| `public/icons/favicon.svg`, `favicon-16.png`, `favicon-32.png` | Marca simplificada para o navegador, sem estrela nem detalhes finos |
| `public/illustrations/welcome.webp` | Boas-vindas, 960×420 px |
| `public/illustrations/games/*.webp` | Cinco capas dos jogos, 480×320 px cada |
| `public/social-card.svg`, `social-card.png` | Fonte vetorial e exportação de compartilhamento, 1200×630 px |

O logo raster e as seis ilustrações foram criados com geração de imagem e exportados localmente. As variantes SVG
são desenhos vetoriais da mesma ideia, não cópias exatas pixel a pixel. Os originais gerados permanecem em
`/workspace/generated_images` nesta tarefa; o app usa somente os arquivos exportados no repositório.

As capas usam a mesma família visual: azul profundo, luz dourada, formas grandes e um objeto reconhecível em
primeiro plano. Os nomes e descrições ficam em HTML, fora das imagens. Os WebP são decorativos (`alt=""`), pois os
botões já têm nome em texto. Os ícones de interface usam `currentColor`, traço de 1,75 e a paleta do tema.

## Exportação e conferência

- Preserve proporções ao redimensionar o logo. Não grave cantos transparentes nos arquivos Apple e maskable.
- O favicon é um desenho próprio; não reduza diretamente a ilustração completa a 16 px.
- Para editar a capa social, use `social-card.svg` e reexporte o PNG com as mesmas dimensões. A exportação atual usa
  DejaVu Serif e DejaVu Sans; mantenha essas fontes ou confira novamente o tamanho e a quebra visual do texto.
- As capas são exportadas em WebP com qualidade 86; mantenha os cinco arquivos na mesma dimensão.
- Confira o cabeçalho em 320 e 390 px, o recorte circular do ícone Android e os temas claro e escuro.
- As novas imagens estão no `SHELL` de `public/sw.js`. Ao trocar arquivos de mesmo nome, atualize `CACHE` para que
  instalações existentes recebam a nova arte. Acrescente ao `SHELL` qualquer nova imagem necessária em telas que
  precisam abrir sem uma visita prévia online.

Validação do app: `npm run typecheck`, `npm test -- --maxWorkers=4` e `npm run build`. Para conferir o cache real,
sirva o build com `python3 -m http.server 4183 --bind 127.0.0.1 --directory dist`, espere o service worker controlar
a página, fique offline e abra Jogos pela primeira vez. As cinco capas devem carregar, inclusive após recarregar.
Esse servidor estático evita o `Vary: Origin` do `vite preview`, que interfere no cache de scripts pré-carregados
sem o cabeçalho Origin. O servidor de desenvolvimento não registra o service worker.

# Prompt para desenhar os símbolos dos jogos

Os jogos funcionam sem desenhos: planetas e signos aparecem como letras e os elementos como triângulos simples.
Para ter símbolos desenhados, cole o prompt abaixo numa IA de sua escolha, revise o resultado e substitua o objeto
`SYMBOL_ART` em `src/features/games/art.ts`. O teste `src/features/games/art.test.ts` recusa qualquer coisa fora do
formato (script, cor fixa, imagem, texto).

---

Você vai desenhar 24 símbolos em SVG para um app de recuperação de dependência com visual noturno e dourado
(estilo templo, inspirado na Golden Dawn). Eles aparecem pequenos (20 a 40 px) em peças de jogo e cartas de tarô.

Regras de formato (obrigatórias):
- Cada símbolo é só o MIOLO de um `<svg viewBox="0 0 24 24">`, sem a tag `<svg>`.
- Tags permitidas: `path`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `rect`, `g`.
- Atributos permitidos: `d`, `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `x1`, `y1`, `x2`, `y2`, `width`, `height`, `points`,
  `transform`, `fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `opacity`, `fill-opacity`,
  `stroke-opacity`, `fill-rule`.
- Cor: só `currentColor` ou `none`. O app pinta cada símbolo (dourado nos planetas, a cor do elemento nos signos).
- Traço padrão: o app já aplica `fill="none"`, `stroke="currentColor"`, `stroke-width="1.6"`, pontas e junções
  arredondadas. Só repita esses atributos se precisar de algo diferente (ex.: um ponto cheio com `fill="currentColor"`).
- Nada de texto, letras, `<text>`, imagens, `style`, `class`, `id`, links, scripts ou eventos.
- Deixe 2 px de margem dentro do quadrado 24×24 e use o mesmo peso de traço em todos.

Desenhos (use as formas tradicionais da astrologia e da alquimia, limpas e legíveis em tamanho pequeno):
- Planetas: `sol` ☉, `lua` ☽ (crescente), `mercurio` ☿, `venus` ♀, `marte` ♂, `jupiter` ♃, `saturno` ♄.
- Signos: `aries` ♈, `touro` ♉, `gemeos` ♊, `cancer` ♋, `leao` ♌, `virgem` ♍, `libra` ♎, `escorpiao` ♏,
  `sagitario` ♐, `capricornio` ♑, `aquario` ♒, `peixes` ♓.
- Elementos (triângulos alquímicos): `fogo` (triângulo para cima), `agua` (para baixo), `ar` (para cima com barra
  horizontal), `terra` (para baixo com barra horizontal).
- `verso`: ornamento para o verso das cartas do tarô. Uma estrela de oito pontas dentro de um círculo, com um
  pequeno losango no centro. Elegante e simétrico.

Responda APENAS com este bloco de código TypeScript, completo, com as 24 chaves nesta ordem:

```ts
export const SYMBOL_ART: Partial<Record<ArtId, string>> = {
  sol: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  lua: '...',
  // ... mercurio, venus, marte, jupiter, saturno, aries, touro, gemeos, cancer, leao, virgem, libra,
  // escorpiao, sagitario, capricornio, aquario, peixes, fogo, agua, ar, terra, verso
};
```

Use aspas simples por fora e aspas duplas dentro dos atributos.

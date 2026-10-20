# Como contribuir

Obrigado por querer ajudar. Este app é usado por pessoas em um momento frágil da vida, então cada mudança passa por
uma pergunta só:

> **Isso ajuda alguém a atravessar um momento difícil, com base clara e sem prometer tratamento?**
> Se a evidência é fraca, a mudança precisa ser simples, opcional e não pode atrapalhar o acesso a uma pausa.

## Princípios que não mudam

1. **Nenhum dado sai do aparelho.** Sem analytics, crash reporting, conta ou servidor. Uma exceção só entra com
   decisão registrada no [`CLAUDE.md`](CLAUDE.md).
2. **A pausa abre na hora.** "Pausa agora" abre sem dados, sem cadastro e sem PIN, em no máximo 2 toques.
3. **Nada zera e nada culpa.** Um dia difícil vira informação, não fracasso. Textos diretos, acolhedores,
   sem moralismo e sem "você falhou".
4. **Linguagem simples.** Sem jargão clínico nem esotérico sem explicação.
5. **Discrição.** Notificações e lembretes não mencionam droga nem recaída.

## Primeira contribuição, passo a passo

1. Escolha uma issue com a etiqueta [good first issue](https://github.com/td9251156-creator/rotina-magica/labels/good%20first%20issue) e comente
   "quero fazer", para ninguém repetir o trabalho.
2. Clique em **Fork** no GitHub e clone o seu fork:
   ```bash
   git clone https://github.com/<seu-usuario>/rotina-magica.git
   cd rotina-magica
   npm install
   git switch -c corrige-mensagem-backup
   ```
3. Faça a mudança e confira: `npm run typecheck && npm test && npm run build`.
4. Envie: `git commit -m "corrige nome na mensagem de backup"` e `git push -u origin corrige-mensagem-backup`.
5. No GitHub, abra o pull request para a `main` deste repositório. O modelo pede o antes e o depois e uma lista
   de conferência. A verificação automática roda sozinha; com ela verde e a revisão aprovada, o PR é mesclado e o
   site é publicado.

Travou em algum passo? Comente na própria issue.

**Idioma:** o app é em português do Brasil. Issues e PRs podem ser em português ou inglês
(issues and pull requests in English are welcome).

## Começando

Requisitos: Node.js 22 LTS.

```bash
npm install
npm run dev        # http://localhost:5173 (e no IP da rede, para abrir no celular)
npm test           # Vitest + Testing Library
npm run typecheck
npm run build
```

Para ver o app com dados de exemplo sem tocar em nada real: `http://localhost:5173/?demo`.
Também abre pronto no GitHub Codespaces (`.devcontainer/`).

## Onde fica cada coisa

- `src/domain/` — regras puras (rotina, previsão do dia, armadilhas do pensamento, progresso, jogos). **Toda mudança aqui tem teste.**
- `src/data/` — repositórios (`localStorage`). A interface nunca toca no armazenamento direto: usa `useData()`.
  Mudou o formato dos dados? Continue lendo o formato antigo: tem gente com dados no celular.
- `src/features/<tela>/` — telas e componentes.
- `src/ui/` — estilos e componentes compartilhados. Cores só por variáveis CSS (tema claro e noite).

## Fluxo

1. Abra uma issue (ideia ou problema) antes de mudanças grandes.
2. Crie um branch e faça commits pequenos, com mensagens claras no imperativo (de preferência em português): `adiciona …`, `corrige …`.
3. Antes do PR: `npm run typecheck && npm test && npm run build`.
4. No PR, conte o antes e o depois em linguagem simples e, se for recurso novo, a base por trás e seus limites.

## Evidência

Cite a fonte no PR e, se for uma decisão de produto, no [`docs/visao-produto.md`](docs/visao-produto.md).
Funcionalidades sem evidência sólida entram como opcionais.

## Integrações

Serviços externos (voz, IA generativa, sensores) só entram seguindo as regras de [`docs/integracoes.md`](docs/integracoes.md).

## Conteúdo sensível

Nunca commite dados pessoais, chaves, `.env` ou capturas de tela com dados reais (use `?demo`).
Este projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md).

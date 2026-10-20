# Instruções para o Copilot (Rotina Mágica / Recomeço)

O guia completo está em `CLAUDE.md`; aqui vai o essencial.

- App web instalável (PWA) de autocuidado e apoio a quem atravessa momentos difíceis, com ferramentas específicas opcionais para hábitos e substâncias. Vite + React + TypeScript, testes com Vitest.
- Português (pt-BR) na interface, nos comentários e nos commits (`adiciona…`, `corrige…`).
- Dados 100% no aparelho (`localStorage` via `src/data/repositories`). Nunca adicione analytics, crash reporting
  ou qualquer envio de dados para fora sem decisão registrada no `CLAUDE.md`.
- UI não toca no `localStorage`: usa `useData()` (`repos` para ler, `write()` para gravar).
- Regras de negócio são funções puras em `src/domain`, sempre com teste.
- O SOS abre sem dados, sem cadastro e sem PIN (no máximo 2 toques).
- O progresso nunca zera. Texto acolhedor, sem culpa e sem moralismo. Notificações discretas.
- Nunca commite dados pessoais, chaves ou `.env`.
- Antes de abrir PR: `npm run typecheck && npm test && npm run build`.

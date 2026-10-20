# GitHub Student Developer Pack no Rumo

Lista conferida no site oficial ([education.github.com/pack](https://education.github.com/pack)) em 2026-10-16.
Regra do projeto: nada que mande dados para fora do celular, e nada que vire cobrança sem o autor decidir.

**Como ativar qualquer oferta:** entre em education.github.com/pack com a conta GitHub já verificada como estudante,
procure a oferta e clique em "Get access" (cada parceiro pede login próprio). Nenhuma delas precisa de cartão para
ativar; se alguma pedir cartão, pare e não cadastre.

## Já em uso no Rumo (custo zero)

| Benefício | O que dá ao Rumo | Como ativar | Depois do período grátis |
|---|---|---|---|
| **GitHub Pro** | Publicar o app no Pages a partir de repositório privado; mais minutos de Actions (CI) | Automático com a verificação de estudante | Pago quando deixar de ser estudante (hoje US$ 4/mês). Sem ele, o Pages de repositório privado para: dá para tornar o repositório público, porque os dados nunca ficam nele |
| **GitHub Pages** | É onde o app mora: https://td9251156-creator.github.io/rotina-magica/ | Já ativo (Settings → Pages → GitHub Actions) | Grátis em repositório público |
| **Copilot (plano Student)** | Sugestões de código no VS Code ou no Codespaces. O repositório já tem `.github/copilot-instructions.md` com as regras do app | github.com/settings/copilot → ativar o plano Student | Grátis enquanto for estudante; só cobra se você assinar outro plano |
| **Codespaces (nível Pro)** | Editar e rodar o app no navegador, sem instalar nada no PC. O repositório já tem `.devcontainer/` (Node 22, `npm install` automático) | No repositório: Code → Codespaces → Create codespace. Depois `npm run dev` e abrir a porta 5173 | Cota mensal grátis. Para nunca cobrar: Settings → Billing → Codespaces com limite de gasto 0, e pare o codespace quando terminar |

## Vale a pena, mas tem custo depois (precisa da sua decisão)

| Benefício | O que daria | Custo depois |
|---|---|---|
| **Domínio** (Namecheap .me, .TECH ou Name.com, 1 ano) | Endereço curto e discreto para o app, em vez do github.io | Renovação paga todo ano. Se não renovar, o endereço para e o app precisa voltar para o github.io (os dados no celular ficam no endereço antigo: teria que fazer backup e restaurar) |
| **1Password** (2 anos) | Guardar a senha do backup cifrado e o PIN | Pago depois de 2 anos. Exporte as senhas antes de vencer se não quiser assinar |
| **BrowserStack / LambdaTest** (1 ano) | Testar o app em outros modelos de Android antes de mostrar para outras pessoas | Pago depois de 1 ano; só ative quando for testar |

## Para aprender e manter o app você mesmo (grátis, opcional)

- **Frontend Masters** (6 meses): cursos de React e TypeScript, as tecnologias do Rumo.
- **JetBrains** (renovado todo ano enquanto estudante): WebStorm, alternativa ao VS Code.
- **Icons8** (3 meses) / **IconScout** (1 ano): ícones se for redesenhar a tela inicial.

## Recusados de propósito

- **Sentry** e outros monitores de erro: mandam dados do aparelho para fora. Contra a regra do `CLAUDE.md`.
- **Azure (US$ 100), Heroku, Appwrite, MongoDB Atlas**: servidor e nuvem. O Rumo é 100% local de propósito.

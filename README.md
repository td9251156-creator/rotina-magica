# Rotina Mágica

[![CI](https://github.com/td9251156-creator/rotina-magica/actions/workflows/ci.yml/badge.svg)](https://github.com/td9251156-creator/rotina-magica/actions/workflows/ci.yml)
[![CodeQL](https://github.com/td9251156-creator/rotina-magica/actions/workflows/codeql.yml/badge.svg)](https://github.com/td9251156-creator/rotina-magica/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/td9251156-creator/rotina-magica)](https://github.com/td9251156-creator/rotina-magica/releases)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-c9a45c)](LICENSE)

**Pequenos cuidados para quem está passando por momentos difíceis.**

Um app de código aberto, gratuito, offline e privado para atravessar dias de ansiedade, tristeza, solidão,
cansaço ou sobrecarga. Não é preciso estar bem, ter uma meta pronta ou receber um diagnóstico para começar.

- **Abrir o app:** https://td9251156-creator.github.io/rotina-magica/
- **Conhecer com dados de exemplo:** https://td9251156-creator.github.io/rotina-magica/?demo

A demonstração usa dados descartáveis em memória. O app não tem conta, servidor de dados, analytics ou envio de
relatos pessoais. Instale na tela inicial pelo navegador para voltar mais facilmente e usar offline após o primeiro carregamento.

## Um cuidado de cada vez

- **Hoje:** sugestões pequenas para acalmar o corpo, dar espaço a pensamentos ou buscar companhia. Sem obrigação
  de manter uma sequência ou estar melhor ao terminar.
- **Vivências e terapias:** oito exercícios de autocuidado, organizados pelo que a pessoa precisa no momento.
  Cada um mostra a duração aproximada, o progresso, um passo de cada vez e onde uma resposta será guardada.
- **Pausa agora:** orientação pelos sentidos e pausa ao corpo, sem exigir cadastro nem PIN.
  Com o PIN fechado, frases pessoais ficam escondidas.
- **Diário:** humor, peso do momento e anotações opcionais. Dias sem registro não viram notas baixas.
- **Jogos:** uma pausa para mudar o foco ou respirar, com controles visuais, toque e teclado.
- **Privacidade:** dados no aparelho, PIN opcional e backup cifrado com senha. Sem nuvem.

As vivências incluem voltar ao aqui e agora, fazer uma pausa ao corpo, ser gentil consigo, dar espaço a um
pensamento, escolher um passo pequeno, pedir companhia, estabelecer limites e fechar o dia sem cobrança.
Reflexões temporárias não são salvas. As frases que viram kit pessoal só são guardadas ao concluir o exercício.

## Limites do aplicativo

Os exercícios são inspirados em atenção ao presente, autocompaixão, TCC, ACT e comunicação. Isso não transforma o
app em psicoterapia nem demonstra que ele trata ansiedade, depressão ou outra condição. Você pode adaptar ou
interromper uma prática que não estiver confortável. A espiritualidade segue opcional.

## Quem já usava o app

A origem do projeto é o apoio a quem quer mudar a relação com o uso de substâncias. Essas ferramentas continuam
em **Ajustes → Como o app pode me apoiar → Hábitos e uso de substâncias**, incluindo prevenção, registro de uso,
planos de noite e os indicadores anteriores.

Instalações antigas mantêm esse foco até a pessoa escolher outro. A troca não apaga o kit, jogos, vivências ou
registros. O diário geral usa humor e estresse; os dados antigos de fissura e uso mantêm o significado original.
Mais em [proposta e compatibilidade](docs/proposta-acolhimento.md).

## Desenvolver

Requisito: Node.js 22 LTS.

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Vite, React e TypeScript. Regras em `src/domain/`, interface em `src/features/` e armazenamento local em
`src/data/`. Veja [CONTRIBUTING.md](CONTRIBUTING.md), [CLAUDE.md](CLAUDE.md) e [SECURITY.md](SECURITY.md).
O site é estático; a publicação no GitHub Pages continua pelo workflow existente.

Sugestões de contribuição incluem revisão com leitor de tela, testes da instalação offline em aparelhos reais,
melhorias de linguagem simples e tradução da documentação. Abra uma issue contando o que pretende testar ou mudar
para combinarmos o escopo antes do pull request.

O projeto permanece gratuito, sem anúncios e sem coleta de dados. [Apoie o projeto](https://github.com/sponsors/td9251156-creator)
e veja [como o apoio é usado](docs/apoio-financeiro.md).

## Projeto e comunidade

O projeto está em manutenção ativa. Mudanças passam por testes automatizados, revisão e publicação pelo GitHub
Pages. Consulte o [histórico de versões](CHANGELOG.md), a [governança](GOVERNANCE.md), o
[guia de contribuição](CONTRIBUTING.md) e a [política de segurança](SECURITY.md).

Como o aplicativo não usa analytics, seu impacto é acompanhado somente por sinais públicos e voluntários:
estrelas, forks, issues, pull requests e relatos que as próprias pessoas decidam compartilhar. Veja como
[participar pelas issues](https://github.com/td9251156-creator/rotina-magica/issues).

Licença [MIT](LICENSE). Os áudios anteriores continuam no módulo de origem; as novas vivências usam, opcionalmente,
a voz disponível no aparelho. Não são reutilizadas gravações com textos que não correspondam ao passo.

**English:** Rotina Mágica is an open-source, private, offline-first self-care app for people going through difficult
times. It offers short guided exercises, a feelings journal, focus games and quick access to support. It is not
psychotherapy, diagnosis or a treatment claim. Its original substance-use support tools remain optional, and
existing users keep their data and workflow. Issues and pull requests in English are welcome.

# Manutenção contínua por agentes

O sistema usa agentes para reduzir trabalho repetitivo sem entregar a direção do produto. Ele separa análise,
implementação e revisão e nunca mescla ou publica uma mudança sozinho.

## Fluxo

1. **Scout:** uma vez por semana, lê código, documentação e histórico e cria ou atualiza uma única issue com até
   três problemas priorizados.
2. **Decisão humana:** o mantenedor ajusta o escopo e aplica `agent:approved` apenas à tarefa escolhida.
3. **Implementer:** cria uma mudança de escopo único, executa `typecheck`, testes e build e abre um PR em rascunho.
4. **Verificação:** uma execução explícita valida o primeiro commit, roda CodeQL e publica uma revisão independente.
5. **Reviewer:** novas alterações no PR também recebem uma revisão independente; o agente não aprova nem mescla.
6. **Relatório:** no primeiro dia de cada mês, uma issue fechada registra métricas públicas do mês anterior.
7. **Mantenedor:** revisa comportamento, riscos e evidências e decide se altera, fecha ou mescla o PR.

Há no máximo uma proposta e um PR automatizado em andamento, com no máximo uma implementação a cada sete dias. O
objetivo é resolver problemas; quantidade de código ou de funcionalidades não é uma métrica de sucesso.

## Limites de implementação

- No máximo 20 arquivos, 1.000 linhas adicionadas ou removidas e 2 MB de diff por execução.
- O Implementer só pode alterar `src/`, `public/`, `docs/` e `README.md`; binários e links simbólicos são bloqueados.
- Nenhum push direto à `main`, autoaprovação, automerge, tag ou release.
- O agente não recebe `GITHUB_TOKEN`; ele só fica disponível num passo posterior que publica a branch e o PR.
- O texto da issue é tratado como entrada não confiável. O Implementer recebe somente a seção `## Tarefa aprovada`,
  que o mantenedor deve revisar antes de aplicar a etiqueta.
- A configuração Git, os hooks, o commit-base e o diff são conferidos antes e depois dos testes.
- A versão do Codex CLI é fixa no lockfile; saídas têm limite de tamanho e verificação de padrões de segredo.
- Código gerado precisa passar pelos mesmos testes, CodeQL, revisão do CODEOWNERS e regras de proteção da branch.

## Prioridade e conclusão

Ordem: privacidade e integridade dos dados; acesso à Pausa agora; acessibilidade, offline e bugs; atrito; recursos
novos com demanda ou base clara.

Uma tarefa só está pronta quando tem problema reproduzível, público afetado, critérios de aceite, limites e testes
esperados. Para ser concluída, precisa preservar dados antigos e privacidade, passar pela suíte e pelo build e,
quando muda a interface, considerar teclado, leitor de tela e movimento reduzido.

## Métricas sem analytics

- regressões, falhas de CI e issues reabertas;
- alertas de segurança e tempo até correção;
- tamanho do bundle e cobertura do cache offline;
- tempo de resposta a issues e revisão de PRs;
- contribuições externas, releases e feedback voluntário sem dados pessoais;
- proporção de propostas aceitas e de PRs automatizados efetivamente mesclados.

O workflow `Maintenance Report` reúne mensalmente CI, issues, PRs, releases e contribuições externas em uma issue
fechada e reproduzível. Ele usa apenas dados públicos do GitHub, não precisa da chave da OpenAI e não mede uso do
aplicativo nem resultados de saúde.

## Ativação

1. Adicione `OPENAI_API_KEY` em **Settings → Secrets and variables → Actions → Secrets**. Para manter
   compatibilidade com a configuração inicial deste repositório, os workflows também aceitam `API_OPENIA`.
2. Proteja `main`: exija pull request, uma revisão do CODEOWNERS, CI e CodeQL; bloqueie force push e exclusão.
3. Deixe o Scout funcionar por duas semanas antes de aprovar a primeira implementação.
4. Para iniciar uma tarefa, revise a seção `## Tarefa aprovada` e aplique a etiqueta `agent:approved`. Somente uma
   etiqueta aplicada pelo proprietário do repositório inicia o Implementer.

Os workflows falham cedo e explicam a ausência do secret. O aplicativo continua funcionando e sendo publicado sem
essa automação.

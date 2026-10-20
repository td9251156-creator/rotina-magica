# Roadmap — Rotina Mágica

O roadmap descreve problemas a resolver, não uma fila automática de funcionalidades. O histórico do que já foi
entregue fica no [CHANGELOG.md](CHANGELOG.md).

## Agora

### Validar a experiência em aparelhos reais

- **Problema:** testes automatizados não reproduzem todas as diferenças de instalação, áudio, teclado e uso offline.
- **Hipótese:** uma matriz curta de testes em Android, iOS e computador encontra falhas antes de afetarem mais pessoas.
- **Validação:** registrar aparelho, navegador, fluxo verificado e problema encontrado, sem dados pessoais.
- **Limite:** não adicionar analytics nem coletar relatos dentro do aplicativo.

### Melhorar acessibilidade

- **Problema:** os fluxos visuais precisam de validação contínua com teclado, leitor de tela e movimento reduzido.
- **Hipótese:** revisões por fluxo reduzem barreiras sem aumentar a complexidade da interface.
- **Validação:** checklist reproduzível e correções acompanhadas por testes quando possível.
- **Limite:** preservar a Pausa agora em até dois toques e o funcionamento offline.

### Construir uma comunidade de manutenção

- **Problema:** o projeto ainda depende principalmente de um mantenedor.
- **Hipótese:** issues pequenas, contexto claro e revisão rápida facilitam contribuições externas.
- **Validação:** tempo de resposta, PRs externos concluídos, issues reabertas e feedback voluntário.
- **Limite:** quantidade de funcionalidades, commits ou issues não conta como impacto por si só.

## Depois

- Consolidar feedback voluntário sobre clareza e utilidade das vivências, sem dados sensíveis.
- Revisar tamanho do bundle, cache offline e desempenho em aparelhos modestos.
- Ampliar documentação em inglês quando houver colaboração para mantê-la atualizada.
- Avaliar empacotamento Android somente se resolver uma limitação comprovada da PWA.

## Explorar

- Novas vivências somente quando houver uma necessidade observada, base clara e forma segura de validação.
- Automação de manutenção por agentes conforme [política e operação](docs/manutencao-agentes.md).
- Recursos que precisem de servidor, conta ou coleta de dados continuam fora do produto.

## Ordem de prioridade

1. Privacidade, perda de dados e acesso à Pausa agora.
2. Acessibilidade, funcionamento offline e bugs reproduzíveis.
3. Redução de atrito em fluxos existentes.
4. Recursos novos com demanda ou base clara.

Uma proposta pode usar `(impacto × confiança) ÷ (esforço × risco)` para comparação. Qualquer quebra de privacidade,
compatibilidade dos dados ou promessa clínica veta a mudança, independentemente da pontuação.

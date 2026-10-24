# Histórico de versões

Este projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/) a partir da primeira release pública.

## Não lançado

### Adicionado

- Check-in de um toque na tela inicial: o humor do dia vai para o Diário e o app sugere um cuidado que combina.
- "Sua semana": os dias em que você se cuidou nos últimos 7, sem sequência para quebrar.
- À noite, o convite do dia passa a ser a Rotina para dormir.
- Rotina para dormir: preparar o quarto, uma vivência curta para soltar o corpo e deixar as preocupações para
  amanhã, e um som que desce devagar e some sozinho em 30 minutos.
- Manutenção contínua por agentes em três papéis: Scout, Implementer e Reviewer.
- Aprovação exclusiva do proprietário, PR em rascunho, limites de diff e bloqueio de arquivos sensíveis.
- CODEOWNERS, roadmap orientado a problemas e formulário voluntário de feedback.
- Verificação explícita do primeiro commit de cada agente e relatório mensal de manutenção com dados públicos.

### Alterado

- Nova identidade nas telas Hoje, Diário, Pausa agora e Vivências, a partir do protótipo de design: uma pergunta
  grande por tela, o humor como um sol que nasce no horizonte, peso do momento em barras de 0 a 10 e fonte Literata
  (guardada no app, funciona sem internet).
- A barra de baixo tem cinco itens, com "Pausa agora" no centro e sempre na mesma cor; Vivências virou aba.
- Vivências: filtros numa linha, um convite do dia em destaque e cada grupo numa lista só, com "Feita hoje · pode
  repetir". Na sessão: fechar de 48 px, progresso em segmentos, sol que respira na pausa, aviso de onde vai cada
  texto escrito e confirmação em folha antes de sair com algo digitado.
- No foco geral, escolher uma opção num passo é opcional, como escrever.

### Corrigido

- Ao concluir uma vivência sem escrever a frase, o app não diz mais que ela "ficou no kit pessoal".
- O app abre mesmo quando o endereço chega por http:// (domínio próprio sem HTTPS forçado): a página troca
  para https:// antes de abrir os dados e, se isso não for possível, abre os registros sem a coordenação entre
  janelas em vez de mostrar "Não foi possível abrir seus registros". PIN e backup avisam quando o endereço não
  permite a criptografia.
- No foco geral, links diretos para A noite (ensaio de recaída), para Arcanos sem os símbolos ou para registrar
  uso não abrem mais essas telas; levam à lista de jogos ou à tela inicial.
- O aviso "Uma atualização está pronta" aparece em qualquer tela, inclusive enquanto outra janela usa os registros.
- O app não fica mais preso em "Use uma aba por vez" quando uma janela antiga (PWA em segundo plano, aba esquecida
  ou link de lembrete da agenda) segura os registros: a janela que a pessoa está vendo assume, e a anterior mostra
  "Usar aqui" sem gravar mais nada.
- Uma tela que não baixa (sem rede ou versão nova publicada) pode ser tentada de novo ou recarregada.

### Desempenho

- Pacote inicial cerca de 25% menor: jogos, vivências, primeiro uso e SOS antigo baixam sob demanda e são
  adiantados quando o navegador fica ocioso.

### Segurança

- O agente que altera código não recebe o token do GitHub e nunca mescla mudanças automaticamente.
- O escopo aprovado, os caminhos permitidos, o tamanho do diff e o estado do Git são validados antes da publicação.
- O Codex CLI tem versão fixa, ambiente mínimo e verificação de possíveis segredos nas saídas publicadas.
- A chave da narração Azure fica disponível somente no passo que gera os áudios.

## 0.3.0 — 2026-10-20

Primeira release pública documentada.

### Adicionado

- Foco geral para ansiedade, tristeza, solidão, cansaço e sobrecarga.
- Oito vivências guiadas organizadas pelo que a pessoa precisa no momento.
- Diário opcional de humor, peso do momento e anotações, com histórico de 14 dias.
- Pausa rápida com orientação pelos sentidos, respiração confortável e carta pessoal.
- Jogos visuais para mudar o foco, com apresentação sem cobrança no modo de bem-estar.
- Modo demonstração, funcionamento offline, PIN opcional e backup cifrado.

### Alterado

- A experiência inicial e a tela Hoje passaram a priorizar pequenos cuidados para momentos difíceis.
- Recomendações deixam de priorizar vivências que a pessoa marcou como mais difíceis.
- Ferramentas anteriores para hábitos e uso de substâncias permanecem disponíveis como foco opcional.
- Documentação, governança, contribuição e segurança foram alinhadas à proposta atual.

### Privacidade e compatibilidade

- Nenhum dado pessoal sai do aparelho; não há conta, servidor de dados ou analytics.
- Instalações e registros anteriores continuam compatíveis.
- O aplicativo oferece autocuidado e não promete diagnóstico, psicoterapia ou tratamento.

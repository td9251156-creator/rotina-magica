# Proteção dos registros e atividades

O app mantém uma cópia dos registros na memória enquanto está aberto. Por isso, duas janelas não podem gravar
essas cópias ao mesmo tempo: uma cópia antiga poderia substituir registros novos, configurações de PIN ou uma
exclusão recente.

Antes de abrir os registros, a entrada do aplicativo solicita uma Web Lock exclusiva para a mesma origem. A
sessão mantém essa posse até a janela fechar ou a árvore do aplicativo desmontar. A próxima janela só cria seus
repositórios depois de conseguir a posse, lendo então o estado atual. O modo demonstração usa apenas memória e
não disputa o acesso aos registros.

Na janela que aguarda, a Pausa continua acessível por um botão. Ela usa repositórios temporários vazios: não lê
o PIN, carta ou histórico e não grava respostas no armazenamento do aparelho. O aviso permanece visível durante
a Pausa. Se a outra janela fechar durante a atividade, a Pausa temporária continua até a pessoa escolher voltar.

Se o navegador não oferecer Web Locks, ou negar essa operação, os registros não são abertos para escrita. A
Pausa temporária continua disponível e a tela sugere reabrir em navegador atualizado. Web Locks exige contexto
seguro: HTTPS em produção ou localhost em desenvolvimento. Não há servidor ou serviço externo nessa coordenação.

Uma alteração externa do armazenamento encerra a interface pessoal e oferece reabertura com os dados atuais.
Isso também detecta alterações feitas por versões antigas do app. Porém, código antigo já aberto não passa a
participar do mecanismo novo: ao instalar essa atualização, feche as outras janelas antigas uma vez. A proteção
completa entre sessões pressupõe que todas estejam usando a versão atual.

## Backup e atualização

Restaurar exige confirmar que o conteúdo atual será substituído. É possível cancelar e baixar um backup antes.
Depois de cancelar ou errar uma senha, o mesmo arquivo pode ser selecionado novamente. Backups antigos permanecem
compatíveis; a confirmação não muda a validação nem a criptografia.

Atualizar exige confirmar que atividades e textos ainda não guardados serão encerrados. Cancelar mantém a
atividade atual e deixa a atualização disponível. Reflexões temporárias não passam a ser salvas automaticamente.

## Validação

- Duas janelas da mesma origem: só a primeira abre os registros; a segunda oferece Pausa temporária.
- Salve uma carta ou ative PIN na primeira. Feche-a e confira que a segunda abre o estado novo sem apagá-lo.
- Apague dados na primeira e feche-a: a segunda não deve trazer o conteúdo antigo de volta.
- Repita com PWA instalada e aba do navegador, offline e após encerramento inesperado de uma janela.
- Cancele restauração e atualização: nenhum dado deve mudar e nenhuma recarga deve ocorrer.
- Erre a senha do backup, corrija e escolha o mesmo arquivo novamente.

As regras da camada de dados continuam síncronas; seu acesso persistente na interface deve permanecer dentro de
StorageSession. Não introduza outra entrada que abra repositórios persistentes fora dessa coordenação.

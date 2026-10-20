# Experiência dos jogos

As melhorias mantêm os cinco motores de jogo, o histórico local e as regras de pontuação e XP. A apresentação
compartilhada fica em `src/features/games/GameGuide.tsx` e `games.css`; as capas continuam locais e no cache offline.

| Ponto encontrado | Mudança |
|---|---|
| Instruções concentradas num parágrafo | Capa, objetivo curto e três passos com ícones; instruções completas em um painel que abre |
| Controles de Blocos só com símbolos | Setas SVG e nomes visíveis, controles desativados durante a pausa e orientação sobre a sombra da queda |
| Tabuleiro muito pequeno na horizontal | Tabuleiro com tamanho mínimo e controles ao lado em telas largas e baixas |
| Peças presas e combinações pouco explicadas | Pares mostra o que está livre, a próxima ação, o resultado da dica e a restauração ao desfazer |
| Cartas pequenas em telas baixas | Arcanos mantém largura mínima de 44 px; pares encontrados têm marca de conclusão |
| Respiração sem contagem clara | Fases 4–2–6, anel de tempo, contagem central e instrução de segurar/soltar no mesmo lugar |
| História sem orientação sobre avanço | Cenário, horário, progresso, escolhas numeradas e efeito da decisão; a explicação e Continuar entram na área visível |
| Resultado só com números | Conclusão acolhedora, pontos, XP e progresso de nível identificados |

Também foram corrigidos três comportamentos na interface: Espaço sobre um botão de Blocos não provoca uma
segunda jogada pelo atalho global; Pares registra os 17 pares ao concluir a partida curta; Segura a onda avisa
uma vez para soltar, cancela gestos interrompidos e encerra o sexto ciclo sem depender de um sétimo. A troca de
aba interrompe a respiração atual sem registrar um ciclo por engano.

## Validação

`npm run typecheck`, `npm test -- --maxWorkers=4` e `npm run build`.

Os testes de interação cobrem teclado, pausa, dica/desfazer/conclusão de Pares e os ciclos de respiração.
A conferência no Chromium percorre os cinco jogos até o resultado em 320×568, 390×844, 844×390 e 768×1024,
nos temas claro e escuro, com movimento reduzido. Confira também o acesso pelo SOS e o primeiro acesso offline
aos jogos a partir do build servido estaticamente, como descrito em `identidade-visual.md`.

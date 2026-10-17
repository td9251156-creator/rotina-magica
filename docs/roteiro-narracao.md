# Roteiro para narração gravada

A voz do celular já fala este roteiro nas práticas. Para soar como uma meditação guiada gravada de verdade
(voz humana grave, nomes vibrados por vários segundos), cada fase pode virar um arquivo de áudio que o app
toca no lugar da voz do celular: `public/audio/practices/<arquivo>.mp3`, com os nomes abaixo. Se o arquivo
não existir, a voz do celular assume. Copiado de `src/domain/routine.ts` (campo `guide`) em 2026-10-17:
se o texto mudar lá, atualize aqui.

## Como gravar (medido nos áudios de referência)

- **Voz:** grave e calma (nas referências, voz masculina em torno de 115 Hz), devagar, frases curtas de 1 a 3 segundos.
- **Silêncio:** perto de 1 segundo entre pedaços da frase e 2 a 3 segundos entre frases; quase nunca mais de 8 segundos.
  A voz ocupa cerca de metade do tempo.
- **Nomes vibrados:** cada sílaba sustentada, de 4 a 9 segundos por nome, puxando o ar entre uma vez e outra.
- **Duração:** o arquivo não pode passar do tempo da fase (indicado em cada título), senão é cortado.
- **Fundo:** grave só a voz. O app toca o "Som de fundo" (acorde suave de dó menor com sétima, bem abaixo da voz)
  quando a pessoa liga.
- **Formato:** MP3 mono, 64 a 96 kbps. Antes de publicar, confira a licença da voz (ver `docs/integracoes.md`).
- **Nunca** use trechos de áudios de terceiros: as referências serviram só para medir ritmo e fundo.

## Foco no triângulo (`triangulo`)

### `triangulo-0.mp3` · Feche os olhos · até 30 s

- Sente-se com a coluna reta, os ombros soltos. Feche os olhos.
- Puxe o ar fundo pelo nariz. E solte devagar.
- Deixe os sons de fora em segundo plano.

### `triangulo-1.mp3` · O triângulo · até 150 s

- Agora, na sua frente, imagine um triângulo.
- Um triângulo vermelho, brilhando, como fogo.
- Veja a ponta de cima. E os dois cantos de baixo.
- As linhas retas, firmes, cheias de luz.
- Não precisa ficar perfeito. Só olhe para ele.
- Repare na cor. Um vermelho vivo, quente.
- Se um pensamento aparecer, tudo bem. Deixe passar, e volte para o triângulo.
- Percorra as linhas com a atenção. Subindo de um lado, descendo do outro.
- Respire devagar. O triângulo continua ali.
- A vontade pode vir, e pode ir embora. O triângulo fica.
- Se a mente fugir, sem problema. É só voltar.
- Veja o triângulo inteiro, de uma vez. Brilhando.
- Fique com ele mais um pouco.
- Agora deixe a imagem sumir, devagar.
- Sinta o corpo, os pés no chão. Quando quiser, abra os olhos.

## Luz pelo corpo (`pilar`)

### `pilar-0.mp3` · Alto da cabeça · até 60 s

- De pé ou sentado, com a coluna reta. Feche os olhos.
- Puxe o ar fundo. E solte devagar.
- Agora imagine, logo acima da cabeça, uma esfera de luz branca.
- Uma luz limpa, muito brilhante.
- Puxe o ar, e vibre o nome, sentindo a cabeça vibrar.
- *(vibrar 3 vezes, puxando o ar entre elas)* **É-rei-iê**
- A luz fica mais forte a cada vez.

### `pilar-1.mp3` · Garganta · até 60 s

- Agora a luz desce, como um raio, até a garganta.
- Ali ela forma uma segunda esfera de luz.
- Uma luz clara, brilhando no pescoço.
- Puxe o ar, e vibre.
- *(vibrar 2 vezes, puxando o ar entre elas)* **Ie-o-vá E-lo-rím**
- Sinta a garganta vibrar com o som.

### `pilar-2.mp3` · Coração · até 60 s

- A luz continua descendo, até o meio do peito.
- Uma esfera quente, dourada, no lugar do coração.
- Puxe o ar, e vibre.
- *(vibrar 2 vezes, puxando o ar entre elas)* **Ie-o-vá E-lo-á Ve-da-át**
- Sinta o calor se espalhar pelo peito.

### `pilar-3.mp3` · Barriga · até 60 s

- A luz desce mais, até logo abaixo do umbigo.
- Uma esfera de luz, firme e tranquila.
- Sinta essa luz bem no centro do corpo.
- Puxe o ar, e vibre.
- *(vibrar 2 vezes, puxando o ar entre elas)* **Xa-dái El Rái**
- A barriga firme, a respiração calma.

### `pilar-4.mp3` · Pés · até 60 s

- Agora a luz desce pelas pernas, até os pés.
- Ela forma a última esfera, entre os pés e o chão.
- Puxe o ar, e vibre.
- *(vibrar 2 vezes, puxando o ar entre elas)* **A-do-nái Ra-A-rets**
- Sinta os pés firmes no chão. Você está aqui, agora.

### `pilar-5.mp3` · Corpo inteiro · até 60 s

- Agora veja a coluna de luz inteira, da cabeça aos pés.
- Ao soltar o ar, a luz desce pela frente do corpo. Ao puxar, ela sobe pelas costas.
- Deixe a luz envolver você, de cima a baixo.
- Calma e firmeza, da cabeça aos pés.
- Agora deixe a imagem sumir, devagar. A calma fica.
- Mexa os dedos. Quando quiser, abra os olhos.

## Relaxar o corpo (`relaxar`)

### `relaxar-0.mp3` · Aperte, Pés e pernas · até 5 s

- Aperte os pés e as pernas, sem dor.

### `relaxar-1.mp3` · Solte, Pés e pernas · até 15 s

- Solte. As pernas pesadas, quentes.
- Respire. E deixe soltar mais um pouco.

### `relaxar-2.mp3` · Aperte, Barriga · até 5 s

- Aperte a barriga.

### `relaxar-3.mp3` · Solte, Barriga · até 15 s

- Solte. A barriga mole, a respiração mais funda.
- Respire. E deixe soltar mais um pouco.

### `relaxar-4.mp3` · Aperte, Mãos e braços · até 5 s

- Feche as mãos e aperte os braços.

### `relaxar-5.mp3` · Solte, Mãos e braços · até 15 s

- Solte. As mãos abertas, os braços pesados.
- Respire. E deixe soltar mais um pouco.

### `relaxar-6.mp3` · Aperte, Ombros · até 5 s

- Suba os ombros até as orelhas.

### `relaxar-7.mp3` · Solte, Ombros · até 15 s

- Solte. Os ombros descem, longe das orelhas.
- Respire. E deixe soltar mais um pouco.

### `relaxar-8.mp3` · Aperte, Rosto · até 5 s

- Aperte os olhos e a boca.

### `relaxar-9.mp3` · Solte, Rosto · até 15 s

- Solte. A testa lisa, o queixo solto.
- Respire. E deixe soltar mais um pouco.

### `relaxar-10.mp3` · Corpo inteiro · até 30 s

- Agora o corpo inteiro. Respire devagar.
- Cada vez que o ar sai, você solta mais um pouco.
- Fique assim, pesado e solto. Quando quiser, volte devagar.

## Parar e respirar (`sober`)

### `sober-0.mp3` · Pare · até 10 s

- Pare o que está fazendo.
- Se der, feche os olhos.

### `sober-1.mp3` · Observe · até 45 s

- Agora observe. O que o corpo está sentindo?
- Um aperto, calor, o coração rápido. Só repare.
- Que emoção está aí? Raiva, tédio, tristeza?
- E que pensamento está passando? Só repare, sem brigar.
- Nada precisa mudar agora. Você só está olhando.

### `sober-2.mp3` · Respire · até 60 s

- Agora leve a atenção para a respiração.
- O ar entrando. E saindo.
- A barriga sobe, e desce.
- Não precisa controlar. Só acompanhe.
- Se a mente fugir, tudo bem. Volte com calma para o ar.
- Sinta o ar fresco entrando, e morno saindo.
- Inspirando. E soltando.
- Mais uma vez. Inspirando. E soltando.

### `sober-3.mp3` · Amplie · até 40 s

- Agora abra a atenção para o corpo inteiro.
- Os pés no chão. As mãos. O rosto.
- O lugar onde você está, os sons em volta.
- A vontade pode estar aqui. E você é maior do que ela.

### `sober-4.mp3` · Escolha · até 25 s

- Com mais calma, pergunte: qual é o próximo passo que cuida de você?
- Pode ser pequeno. Um copo de água, uma mensagem, sair dali.

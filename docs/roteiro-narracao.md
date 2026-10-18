# Roteiro para narração gravada

A narração das práticas guiadas (`public/audio/practices/<arquivo>.mp3`) toca no lugar da voz do celular
quando a pessoa liga "Ouvir a voz guiando"; sem o arquivo, a voz do celular assume. Os arquivos atuais
foram gerados com voz neural (seção abaixo) e podem ser trocados por uma gravação humana com os mesmos
nomes. O texto vem de `src/domain/routine.ts` (campo `guide`); um teste confere que este roteiro e os
arquivos seguem o app.

## Voz neural

- **Modelo:** [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) v1.0 (hexgrad, licença Apache-2.0), voz
  `pm_alex` (português do Brasil, masculina), rodando no computador de quem mantém, sem internet nem conta.
  Arquivos: `onnx/model.onnx` e `voices/pm_alex.bin` de
  [onnx-community/Kokoro-82M-v1.0-ONNX](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX)
  (os mesmos arquivos também vêm nos pacotes npm `kokoro-js` e `kokoro-fp32*-shards`).
- **Gerar:** `pip install kokoro-onnx soundfile`, ffmpeg com rubberband e libmp3lame, e
  `python3 scripts/gerar-narracao.py --model model.onnx --voice pm_alex.bin` (`--only pilar` gera só uma prática).
- **O que o script faz:** fala cada frase inteira, sem cortar as pausas que a própria voz faz e sem mudar o tom
  (os dois deixavam a fala travada e robótica), deixa cerca de 1 segundo entre frases, espalha as falas pela
  fase, vibra os nomes (vogais longas esticadas de leve), põe uma reverberação de sala pequena e iguala o volume.
- **Voz mais natural (Azure):** a voz `pt-BR-AntonioNeural` da Microsoft soa mais humana que o Kokoro em português.
  Só o texto deste roteiro sai do computador; a licença do Azure permite publicar o áudio gerado. Passos:
  1. Crie uma conta no [Azure for Students](https://azure.microsoft.com/free/students/) (vem no GitHub Student Pack,
     sem cartão) e um recurso **Speech** (plano gratuito F0; o roteiro inteiro usa menos de 1% da cota do mês).
  2. Copie a chave e a região do recurso (em "Keys and Endpoint"). Nunca coloque a chave em arquivo do repositório.
  3. No terminal: `pip install soundfile numpy`, e então
     `AZURE_SPEECH_KEY=sua-chave AZURE_SPEECH_REGION=brazilsouth python3 scripts/gerar-narracao.py --engine azure`
     (no PowerShell: `$env:AZURE_SPEECH_KEY="sua-chave"; $env:AZURE_SPEECH_REGION="brazilsouth"` antes do comando).
  4. Ouça os arquivos em `public/audio/practices/`, suba `CACHE` em `public/sw.js` e abra um PR.

  O gerador escolhe sozinho a voz mais natural que a região tiver (HD, depois multilíngue, depois a Antonio)
  e manda cada fase inteira num pedido só (pausas de até 5 s entre as falas, 0,7 s entre frases), sem mexer
  no tom nem pôr eco: a voz respira e emenda como numa gravação contínua. Para comparar vozes:
  `python scripts/gerar-narracao.py --engine azure --listar-vozes` e depois
  `--voice NOME --only sober` (ex.: `pt-BR-ThalitaMultilingualNeural`, `pt-BR-FranciscaNeural`).
- **Voz de gente:** grave as falas no celular (gravador de voz, num lugar quieto), uma gravação por arquivo da lista
  abaixo, seguindo "Como gravar". Quem mantém o app corta, iguala o volume e troca os arquivos.
- **Trocou um arquivo?** Suba `CACHE` em `public/sw.js`: quem já ouviu guarda o áudio antigo no celular.

## Linguagem das falas

As falas usam recursos de relaxamento guiado e hipnose clínica (estilo permissivo, de Milton Erickson) e
dois da PNL, sempre como jeito de falar, sem promessa de cura e com a pessoa no controle:

- **Permissão, não ordem:** "você pode", "talvez", "quando quiser"; os dois jeitos de imaginar valem.
- **Acompanhar e conduzir:** descrever o que já está acontecendo (os sons, o ar, os pés no chão) e só depois
  sugerir o próximo passo ("e, enquanto você olha, a respiração pode ir ficando mais lenta").
- **Aprofundar aos poucos:** cada volta, cada respiração "um pouco mais".
- **Âncora (PNL):** juntar o polegar e o indicador no auge da calma, para usar o gesto quando a vontade vier.
- **Ensaio do futuro (PNL):** imaginar o próximo passo já sendo feito.
- **Segurança:** "quem conduz é você, pode abrir os olhos a qualquer momento"; toda prática termina trazendo
  a pessoa de volta (mexer os dedos, abrir os olhos).

Evidência: hipnose e relaxamento guiado têm efeito moderado em ansiedade e estresse; a PNL tem pouca evidência
própria, por isso entra só como linguagem, sem custo e dentro de práticas que já têm base.

## Como gravar (medido nos áudios de referência)

- **Voz:** grave e calma (nas referências, voz masculina em torno de 115 Hz), devagar, frases curtas de 1 a 3 segundos.
- **Silêncio:** perto de 1 segundo entre pedaços da frase e 2 a 3 segundos entre frases; quase nunca mais de 8 segundos.
  A voz ocupa cerca de metade do tempo.
- **Nomes vibrados:** cada sílaba sustentada, de 4 a 9 segundos por nome, puxando o ar entre uma vez e outra.
- **Duração:** o arquivo não pode passar do tempo da fase (indicado em cada título), senão é cortado.
- **Fundo:** grave só a voz. O app toca o "Som de fundo" (acorde suave de dó menor com sétima, bem abaixo da voz)
  quando a pessoa liga.
- **Formato:** MP3 mono. Antes de publicar, confira a licença da voz (ver `docs/integracoes.md`).
- **Nunca** use trechos de áudios de terceiros: as referências serviram só para medir ritmo e fundo.

## Foco no triângulo (`triangulo`)

### `triangulo-0.mp3` · Feche os olhos · até 30 s

- Encontre uma posição confortável. E deixe os olhos se fecharem.
- Puxe o ar pelo nariz. E, ao soltar, deixe os ombros descerem.
- Os sons de fora podem continuar. Só ajudam você a ficar aqui.

### `triangulo-1.mp3` · O triângulo · até 150 s

- Quem conduz é você. Pode abrir os olhos a qualquer momento.
- Agora, na sua frente, você pode começar a imaginar um triângulo.
- Um triângulo vermelho, brilhando, como fogo.
- Talvez ele apareça nítido. Talvez só como uma ideia. Os dois jeitos funcionam.
- Repare na ponta de cima. E nos dois cantos de baixo.
- E, enquanto você olha, a respiração pode ir ficando mais lenta, sozinha.
- Se um pensamento aparecer, tudo bem. Ele passa, e você volta para o triângulo.
- Percorra as linhas com a atenção. Subindo de um lado, descendo do outro.
- Cada volta pelas linhas deixa a mente um pouco mais quieta.
- A vontade pode vir, e pode ir embora. O triângulo fica.
- Veja o triângulo inteiro, de uma vez. Brilhando.
- Se quiser guardar essa calma, junte o polegar e o indicador, e respire fundo.
- Esse gesto fica com você, para quando a vontade aparecer.
- Agora deixe a imagem ir sumindo, devagar.
- Sinta o corpo, os pés no chão. Quando quiser, abra os olhos.

## Luz pelo corpo (`pilar`)

### `pilar-0.mp3` · Alto da cabeça · até 60 s

- De pé ou sentado, coluna reta. Deixe os olhos se fecharem.
- Puxe o ar fundo. E solte devagar.
- Agora imagine, logo acima da cabeça, uma esfera de luz branca.
- Talvez você veja, talvez só sinta.
- Puxe o ar, e vibre o nome, sentindo a cabeça vibrar.
- *(vibrar 3 vezes, puxando o ar entre elas)* **É-rei-iê**
- A luz fica mais forte a cada vez.

### `pilar-1.mp3` · Garganta · até 60 s

- Agora a luz desce, como um raio, até a garganta.
- Ali ela forma uma segunda esfera de luz.
- E, enquanto ela brilha, o pescoço pode ir se soltando.
- Puxe o ar, e vibre.
- *(vibrar 2 vezes, puxando o ar entre elas)* **Ie-o-vá E-lo-rím**
- Sinta a garganta vibrar com o som.

### `pilar-2.mp3` · Coração · até 60 s

- A luz continua descendo, até o meio do peito.
- Uma esfera quente, dourada. Cada respiração deixa o peito mais calmo.
- Puxe o ar, e vibre.
- *(vibrar 2 vezes, puxando o ar entre elas)* **Ie-o-vá E-lo-á Ve-da-át**
- Sinta o calor se espalhar pelo peito.

### `pilar-3.mp3` · Barriga · até 60 s

- A luz desce mais, até logo abaixo do umbigo.
- Uma esfera de luz, firme e tranquila.
- Você pode sentir essa luz bem no centro do corpo.
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
- Se quiser guardar essa calma, junte o polegar e o indicador.
- Esse gesto fica com você.
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

- Solte. A barriga macia, a respiração mais funda.
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

- Agora o corpo inteiro, pesado e solto.
- Cada vez que o ar sai, você pode descer um pouco mais nessa calma.
- Fique o tempo que quiser. Quando quiser, volte devagar.

## Parar e respirar (`sober`)

### `sober-0.mp3` · Pare · até 10 s

- Pare um instante.
- Se der, deixe os olhos se fecharem.

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
- Pode ser pequeno. Imagine você fazendo ele agora.

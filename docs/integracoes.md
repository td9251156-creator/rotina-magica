# Integrações e serviços externos

O app foi feito para que **nenhum dado da pessoa saia do aparelho** (ver [`CLAUDE.md`](../CLAUDE.md)). Por isso uma
integração só entra se cumprir as cinco regras abaixo.

1. **É opcional e vem desligada.**
2. **Não envia nada que a pessoa escreveu ou registrou.** Se algum dia precisar de rede, a pessoa vê exatamente o que
   vai sair e confirma antes.
3. **"Ajuda agora" continua funcionando sem internet** e sem a integração.
4. **Nenhuma chave de API no código nem no site publicado.** Chave do mantenedor só roda em script no computador dele.
5. **Tem um motivo de recuperação**, não só de tecnologia.

Ordem de preferência:

1. Gerar no computador do mantenedor e publicar como arquivo estático: funciona offline e não envia nada.
2. Rodar no próprio aparelho.
3. Chamar um serviço externo, com consentimento a cada uso.

## Avaliação (lista de prêmios de hackathon da MLH, outubro de 2026)

| Serviço | Combina? | Como usar sem quebrar as regras |
|---|---|---|
| **ElevenLabs** (voz) | Sim, a melhor | Narrar as práticas guiadas (respiração, relaxamento, luz pelo corpo) uma vez e publicar os áudios junto com o app. Funciona offline e não envia nada. Antes: conferir se o plano usado permite publicar o áudio e se pede atribuição. Base sem custo: voz do próprio aparelho ([#7](https://github.com/td9251156-creator/rotina-magica/issues/7)). |
| **Gemini API / Gen AI** (Claude, Gemini e outros) | Sim, com cuidado | Gerar, com revisão humana, mais cenas para "A noite" e mais cartas para o "Rebate", em script no computador do mantenedor. Dentro do app, só como opção desligada e com aviso, nunca em "Ajuda agora": texto sobre uso de droga é dado sensível. |
| **Presage** (sinais vitais pela câmera) | Talvez | Mostrar a respiração desacelerando durante a prática seria um bom reforço, mas só se o processamento for no aparelho. Imagem do rosto é dado sensível: conferir antes de qualquer protótipo. |
| **DEV Writing Challenge** | Sim | Contar como o app foi feito (privacidade, evidência, PWA). Não mexe no código e ajuda a trazer contribuidores. |
| **.Tech / GoDaddy Registry** (domínio) | Talvez | Endereço fácil de lembrar. Atenção: outro domínio é outro site para o navegador, então os dados não vêm junto; precisa de backup e restauração. |
| **Commit Fellowship** | Só se virar empresa | Pede equipe e intenção de abrir um negócio. |
| Solana, Tiger Data, MongoDB Atlas, Backboard, Snowflake, Vultr, DigitalOcean, Auth0 | Não | Precisam de servidor, banco na nuvem, conta ou carteira. O app foi desenhado para não ter nada disso. |

Antes de inscrever o projeto num prêmio, confira as regras do evento: os prêmios valem para projetos inscritos num
hackathon da MLH, e alguns eventos pedem que o trabalho seja feito durante o hackathon.

## Áudio narrado estático

O player aceita arquivos opcionais em `public/audio/practices/`, no formato
`<id-da-pratica>-<indice-da-fase>.mp3`. Os arquivos são empacotados com o PWA e tocados sem internet;
se um arquivo não existir ou falhar, a voz local do aparelho assume. Antes de publicar, confirme a licença
da voz e inclua a atribuição exigida pelo serviço usado para gerar a narração.

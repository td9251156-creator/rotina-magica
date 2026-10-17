# Apoio financeiro

Como o projeto pode receber dinheiro sem trair o que ele é: um app de saúde, gratuito, para pessoas em
momento frágil, com os dados 100% no celular. Avaliado em 2026-10-17, a pedido do autor.

## Regras que valem para qualquer caminho

1. **O app continua inteiro e de graça.** Nada que ajuda na recuperação fica atrás de pagamento: SOS, rotina,
   vivências, jogos, diário, laboratório. Quem mais precisa costuma ter menos dinheiro (e dívida é gatilho).
2. **Nenhum pedido de dinheiro dentro do fluxo de crise** (Ajuda agora, "Usei", práticas guiadas). Se um dia
   houver um link de apoio no app, ele fica discreto em Ajustes, como o CVV.
3. **Nada de anúncio, venda de dados ou rastreador.** Isso já está no CLAUDE.md ("Nunca") e vale também para
   botões de doação: só link comum, sem script de terceiros na página.
4. **Discrição de quem mantém.** As plataformas pedem nome real e conta bancária para pagar; o que aparece em
   público é escolha do autor (dá para usar só o apelido do GitHub).

## Os caminhos, do mais indicado ao menos

| Caminho | Serve? | Custo | O que o autor precisa fazer |
|---|---|---|---|
| **GitHub Sponsors** | Sim, o primeiro a ligar | 0% em doação de pessoa física; até 6% quando quem doa é uma organização (3% cartão + 3% serviço) | Entrar em github.com/sponsors, conferir se o Brasil aparece como região aceita, preencher dados fiscais e bancários (Stripe), criar 2 ou 3 níveis simples |
| **Pix / Apoia.se / Catarse** | Sim, para o público brasileiro | Pix entre pessoas não tem taxa; as plataformas cobram uma porcentagem (conferir no site) | Criar uma chave Pix aleatória (nunca CPF, telefone ou e-mail no repositório) ou uma página no Apoia.se |
| **Ko-fi** | Sim, para doações avulsas | Sem taxa da plataforma em doação avulsa; só a do PayPal ou Stripe | Criar a conta e ligar PayPal ou Stripe |
| **Open Collective** | Depois, se aparecer mais gente mantendo | O anfitrião fiscal cobra uma porcentagem (no Open Source Collective, em torno de 10%: conferir) | Pedir entrada num anfitrião fiscal; faz sentido quando houver despesas a dividir |
| **Editais de impacto social e saúde** | Sim, é onde está o dinheiro maior | Sem taxa; dá trabalho escrever | Ver a lista abaixo |
| **Open-core (versão paga)** | Não | — | Ver o porquê abaixo |
| **Investidor (ex.: OSS Capital)** | Não | — | Procuram empresas com produto para empresas; aqui não há |

### Editais que combinam com o projeto

- **Programas da própria universidade** (extensão, iniciação científica, inovação): o projeto é de um aluno da
  Univesp e é útil para saúde pública. Costuma ser o caminho mais fácil para bolsa.
- **Editais de inovação em saúde e tecnologia social** (fundações de amparo à pesquisa estaduais, CNPq, prêmios
  de tecnologia social). Pedem projeto escrito, cronograma e, às vezes, parceria com serviço de saúde (ex.: um
  CAPS AD que use o app com os pacientes).
- **Fundos para software livre e privacidade** (ex.: NLnet) exigem, em geral, ligação com a Europa: conferir
  cada chamada antes de gastar tempo.
- **Google Open Source Peer Bonus** só acontece se alguém do Google indicar o projeto; não dá para pedir.
- **Fundações de linguagem** (Python, JavaScript) financiam o próprio ecossistema, não apps: não servem aqui.

### Por que não open-core

O modelo "base grátis e recursos pagos" funciona quando empresas pagam por painéis, auditoria ou integrações.
Este app não tem servidor nem empresa cliente, e cobrar a pessoa em recuperação por qualquer parte da ajuda vai
contra o critério do projeto. O que pode ser pago, sem mexer no app:
- **Formação ou consultoria** para serviços de saúde que queiram usar o app com pacientes.
- **Adaptação para um serviço** (ex.: um CAPS com os próprios contatos e textos), publicada como código aberto.

## Primeiros passos sugeridos

1. ~~Ligar o GitHub Sponsors~~ feito pelo autor em 2026-10-17.
2. ~~`.github/FUNDING.yml` com o usuário do GitHub~~ feito: o botão "Sponsor" aparece no topo do repositório.
   Ko-fi ou Apoia.se entram na mesma lista quando o autor criar as contas.
3. ~~Seção "Apoie" no README~~ feito.
4. Só se o autor decidir: um link discreto em Ajustes, nunca na Ajuda agora.
5. Doações recebidas do exterior entram como rendimento no Brasil: guardar os comprovantes e declarar
   (carnê-leão). Na dúvida, falar com um contador.

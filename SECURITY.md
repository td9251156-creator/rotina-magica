# Segurança e privacidade

## Como o app protege os dados

- Tudo fica no aparelho (`localStorage`). Não há servidor, conta, analytics nem crash reporting.
- PIN opcional guardado como hash PBKDF2 com sal; nunca em texto puro.
- Backup opcional cifrado com AES-GCM e uma senha escolhida pela pessoa (Web Crypto, no aparelho).
- Com PIN ativo, "Pausa agora" abre sem pedir o PIN, mas esconde tudo o que a pessoa escreveu (kit, carta, planos).
- O site é estático (GitHub Pages) e usa `noindex`.

## Como reportar um problema

Achou uma falha que pode expor dados de alguém (por exemplo, algo escrito aparecendo com o app trancado)?
**Não abra uma issue pública.** Use a aba **Security → Report a vulnerability** do repositório, com os passos para
reproduzir. Respondemos o quanto antes e avisamos quando a correção estiver no ar.

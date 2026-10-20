#!/usr/bin/env bash
set -uo pipefail

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo '::error title=Configuração ausente::O secret OPENAI_API_KEY não está disponível.'
  exit 1
fi

# Versões recentes do CLI reconhecem os dois nomes. Manter ambos no processo do
# CLI evita depender do método de autenticação padrão de uma versão específica.
export CODEX_API_KEY="${CODEX_API_KEY:-$OPENAI_API_KEY}"

check_file="${RUNNER_TEMP:-/tmp}/openai-api-check.json"
set +e
http_status=$(curl --silent --show-error --connect-timeout 10 --max-time 30 \
  --output "$check_file" --write-out '%{http_code}' \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models)
curl_status=$?
set -e

if [[ "$curl_status" -ne 0 ]]; then
  echo '::error title=Falha de rede::O runner não conseguiu acessar api.openai.com.'
  exit 1
fi

case "$http_status" in
  200) ;;
  401)
    echo '::error title=Chave OpenAI rejeitada::Substitua o valor de OPENAI_API_KEY por uma chave ativa da API Platform.'
    exit 1
    ;;
  403)
    echo '::error title=Permissão OpenAI insuficiente::A chave ou o projeto não permite acesso à API solicitada.'
    exit 1
    ;;
  429)
    echo '::error title=Limite da API OpenAI::Verifique créditos, faturamento e limites do projeto da chave.'
    exit 1
    ;;
  *)
    echo "::error title=API OpenAI indisponível::A verificação retornou HTTP $http_status."
    exit 1
    ;;
esac

error_file="${RUNNER_TEMP:-/tmp}/codex-error.log"
set +e
npx --no-install codex "$@" 2>"$error_file"
codex_status=$?
set -e

python3 - "$error_file" <<'PY'
import os
import re
import sys

text = open(sys.argv[1], encoding='utf-8', errors='replace').read()
for name in ('OPENAI_API_KEY', 'CODEX_API_KEY'):
    secret = os.environ.get(name)
    if secret:
        text = text.replace(secret, '[SEGREDO REMOVIDO]')
text = re.sub(r'sk-[A-Za-z0-9_-]{20,}', '[SEGREDO REMOVIDO]', text)
sys.stderr.write(text)
PY

if [[ "$codex_status" -eq 0 ]]; then
  exit 0
fi

if grep -Eqi 'invalid[_ ]api[_ ]key|incorrect api key|401[^0-9]|unauthorized' "$error_file"; then
  echo '::error title=Chave OpenAI rejeitada::Crie uma nova chave da API Platform e atualize OPENAI_API_KEY.'
elif grep -Eqi 'insufficient_quota|quota|billing|credit|project_spend_limit' "$error_file"; then
  echo '::error title=Créditos da API insuficientes::ChatGPT e API têm faturamentos separados; verifique o projeto da chave.'
elif grep -Eqi 'model.*(not found|access|permission|unsupported)|does not have access.*model' "$error_file"; then
  echo '::error title=Modelo indisponível::O projeto da chave não possui acesso ao modelo selecionado pelo Codex.'
elif grep -Eqi '429|rate.?limit|usage.?limit' "$error_file"; then
  echo '::error title=Limite da API atingido::Aguarde o limite ou ajuste os limites do projeto OpenAI.'
elif grep -Eqi '403|forbidden|permission|not allowed' "$error_file"; then
  echo '::error title=Permissão insuficiente::Revise as permissões da chave e do projeto OpenAI.'
elif grep -Eqi 'network|connect|dns|timed? ?out|connection' "$error_file"; then
  echo '::error title=Falha de rede com a OpenAI::O Codex não conseguiu concluir a conexão com a API.'
else
  echo "::error title=Falha do Codex::O CLI terminou com código $codex_status; consulte as linhas anteriores sem compartilhar a chave."
fi

exit "$codex_status"

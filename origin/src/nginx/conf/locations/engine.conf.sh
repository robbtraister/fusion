#!/bin/sh

. $(dirname "$0")/../variables.sh

cat <<EOB
      rewrite                   ^${API_PREFIX}(/|$)(.*) /\$2 break;
      rewrite                   ^${CONTEXT_PATH}(/|$)(.*) /\$2 break;

EOB

if [ "${HTTP_ENGINE}" ]
  then
    cat <<EOB
      proxy_pass                ${HTTP_ENGINE};
EOB
  else
    cat <<EOB
      proxy_set_header          'X-FunctionName' '${LAMBDA_ENGINE}:\${version}';
      proxy_pass                ${LAMBDA_PROXY:-http://0.0.0.0:${NODEJS_PORT:-9000}}\$uri\$query_params;
EOB
fi

cat <<EOB

      proxy_redirect            / ' ${API_PREFIX}/';
EOB

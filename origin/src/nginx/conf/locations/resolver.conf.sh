#!/bin/sh

cat <<EOB
      rewrite                   ^${API_PREFIX}(/|$)(.*) /\$2 break;
      rewrite                   ^${CONTEXT_PATH}(/|$)(.*) /\$2 break;

      proxy_set_header          'Fusion-Engine-Version' '\${version}';

EOB

if [ "${HTTP_RESOLVER}" ]
then
  cat <<EOB
      proxy_pass                ${HTTP_RESOLVER};
EOB
else
  cat <<EOB
      proxy_set_header          'X-FunctionName' '${LAMBDA_RESOLVER}:production';
      proxy_pass                ${LAMBDA_PROXY:-http://0.0.0.0:${NODEJS_PORT:-9000}}\$uri\$query_params;
EOB
fi

cat <<EOB

      proxy_redirect            /make/ ' ${CONTEXT_PATH}/';
      proxy_redirect            / ' ${API_PREFIX}/';
EOB

#!/bin/sh

. $(dirname "$0")/../variables.sh

cat <<EOB
      rewrite                   ^${API_PREFIX}(/|$)(.*) /\$2 break;
      proxy_pass                http://0.0.0.0:${NODEJS_PORT:-9000}\$uri\$query_params;
      proxy_redirect            / ' ${API_PREFIX}/';
EOB

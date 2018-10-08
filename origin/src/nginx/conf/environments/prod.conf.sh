#!/bin/sh

. $(dirname "$0")/../variables.sh

cat <<EOB
  upstream ${NAME:-$MODE} {
    server 0.0.0.0:${PORT:-8081};
  }

  server {
    listen                      ${PORT:-8081};
    # server_name                 _;

    location @nodejs {
EOB

. $(dirname "$0")/../locations/nodejs.conf.sh

cat <<EOB
    }
    location @resolver {
EOB

. $(dirname "$0")/../locations/resolver.conf.sh

cat <<EOB
    }
    location @engine {
EOB

. $(dirname "$0")/../locations/engine.conf.sh

cat <<EOB
    }
    location @engine_LONGRUNNING {
      proxy_read_timeout        60;
EOB

. $(dirname "$0")/../locations/engine.conf.sh

cat <<EOB
    }

    location @resources {
      return 404;
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(resources)(/.*|$) {
      set                       \$command \$2;
      set                       \$file \$3;
      set                       \$p \$command\$file;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/\$p;
      proxy_pass                \$target;
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(assets|dist)(/.*|$) {
      set                       \$command \$2;
      set                       \$file \$3;
      set                       \$p \$command\$file;

      proxy_intercept_errors    on;
      error_page                400 403 404 = @engine;
      # this endpoint includes template compilation, which can take a bit more time
      error_page                418 = @engine_LONGRUNNING;

      if (\$request_method ~ ^(POST|PUT)$) {
        return                  418;
      }

      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/\$p;
      proxy_pass                \$target;
    }

    location ~ ^${API_PREFIX}/(configs)(/.*|$) {
      set                       \$p /components\$2/fusion.configs.json;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/dist\$p;
      proxy_pass                \$target;
    }

    location ~ ^${API_PREFIX}/(content|render|resolvers)(/.*|$) {
      error_page                418 = @engine;
      return                    418;
    }

    # keep 'resolve' as a group, since the pattern is re-used elsewhere and the trailing endpoint is referenced as $2
    location ~ ^${API_PREFIX}/(resolve)(/.*|$) {
      error_page                418 = @resolver;
      return                    418;
    }

EOB

. $(dirname "$0")/../modes/${MODE}.conf.sh

if [ "${PB_ADMIN}" ]
then
  cat <<EOB
    location ${CONTEXT_PATH}/admin {
      set                       \$target ${PB_ADMIN};
      proxy_pass                \$target;
    }
    location ${CONTEXT_PATH}/app/info {
      set                       \$target ${PB_ADMIN};
      proxy_pass                \$target;
    }
    location ${CONTEXT_PATH}/content/api {
      set                       \$target ${PB_ADMIN};
      proxy_pass                \$target;
    }
EOB
fi

cat <<EOB

    location ${CONTEXT_PATH}/_ {
      rewrite ^${CONTEXT_PATH}/_(.*) ${API_PREFIX}\$1;
    }

    location ~ ^${API_PREFIX}/status/(\\d\\d\\d)$ {
      # nginx can't return dynamic status codes, so proxy to nodejs
      error_page                418 = @nodejs;
      return                    418;
    }

    location = /healthcheck {
      access_log                off;
      add_header                Content-Type text/html;
      return                    200 'OK';
    }

    location = /favicon.ico {
      rewrite                   ^ ${API_PREFIX}/resources/favicon.ico;
    }

    location = / {
      rewrite                   ^ /homepage;
    }

    # admin rewrites
    location = ${CONTEXT_PATH}/content/api/content-config {
      rewrite                   ^ ${API_PREFIX}/configs/content/sources;
    }

    location = ${CONTEXT_PATH}/content/api/fetch {
      rewrite                   ^ ${API_PREFIX}/content/fetch/\${arg_service}?v=\${arg_v}&key=\${arg_config};
    }

    location ~ ^${CONTEXT_PATH}/admin/api/(chain|feature|layout)-config/?$ {
      set                       \$type \$1;
      rewrite                   ^ ${API_PREFIX}/configs/\${type}s;
    }

    location ~ ^${CONTEXT_PATH}/admin/api/(output-type)/?$ {
      set                       \$type \$1;
      rewrite                   ^ ${API_PREFIX}/configs/\${type}s;
    }

    location ~ ^${CONTEXT_PATH}/api/v2/resolve/?$ {
      rewrite                   ^ ${API_PREFIX}/resolve;
    }
    # end of admin rewrites

    location ${API_PREFIX} {
      return                    404;
    }

    # all other requests should be treated as a new page to render
    location / {
      rewrite                   ^(${CONTEXT_PATH})?(.*) ${API_PREFIX}/make\$2;
    }
  }
EOB

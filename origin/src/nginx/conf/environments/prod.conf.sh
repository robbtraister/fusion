#!/bin/sh

cat <<EOB
  upstream ${NAME:-$MODE} {
    server 0.0.0.0:${PORT:-8081};
  }

  server {
    listen                      ${PORT:-8081};
    # server_name                 _;

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
      return                    404;
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(resources)(/.*|$) {
      set                       \$command \$2;
      set                       \$file \$3;
      set                       \$p \$command\$file;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/\$p;
      proxy_pass                \$target;

      add_header                'Fusion-Source' 's3';
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

      add_header                'Fusion-Source' 's3';
    }

    location ~ ^${API_PREFIX}/(configs)(/.*|$) {
      set                       \$p /components\$2/fusion.configs.json;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/dist\$p;
      proxy_pass                \$target;

      add_header                'Fusion-Source' 's3';
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

cat <<EOB

    location ${API_PREFIX} {
      return                    404;
    }

    # all other requests should be treated as a new page to render
    location / {
      rewrite                   ^(${CONTEXT_PATH})?(.*) ${API_PREFIX}/make\$2;
    }
  }
EOB

#!/bin/sh

cat <<EOB
  upstream ${NAME:-local} {
    server 0.0.0.0:${PORT:-8081};
  }

  server {
    listen                      ${PORT:-8081};
    # server_name                 _;

    location @resolver {
EOB

$(dirname "$0")/../locations/resolver.conf.sh

cat <<EOB
    }
    location @engine {
      proxy_read_timeout        60;
EOB

$(dirname "$0")/../locations/engine.conf.sh

cat <<EOB
    }

    location @resources {
      return                    404;
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(resources)(/.*|\$) {
      set                       \$command \$2;
      set                       \$file \$3;
      set                       \$p \$command\$file;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      root                      /etc/nginx/resources;
      try_files                 \$file =404;
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(assets|dist)(/.*|\$) {
      set                       \$command \$2;
      set                       \$file \$3;
      set                       \$p \$command\$file;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      if (\$request_method ~ ^(POST|PUT)\$) {
        return                  418;
      }

      root                      /etc/nginx/dist;
      try_files                 \$file =404;
    }

    location ~ ^${API_PREFIX}/(configs)(/.*|\$) {
      set                       \$p /components\$2/fusion.configs.json;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      root                      /etc/nginx/dist;
      try_files                 \$p =404;
    }

    location ~ ^${API_PREFIX}/(content|render|resolvers)(/.*|\$) {
      error_page                418 = @engine;
      return                    418;
    }

    location ${API_PREFIX}/resolve {
      error_page                418 = @resolver;
      return                    418;
    }

    # strip trailing slashes
    location ~ ^${API_PREFIX}/(fuse|make)(/.*)/$ {
      rewrite                   (.*)/\$ \$1 last;
    }
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|\$) {
      error_page                400 403 404 418 = @resolver;
      return                    418;
    }

    location ${API_PREFIX} {
      return                    404;
    }

    # all other requests should be treated as a new page to render
    location / {
      rewrite                   ^(${CONTEXT_PATH})?(.*) ${API_PREFIX}/make\$2;
    }
  }
EOB

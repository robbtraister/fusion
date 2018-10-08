#!/bin/sh

. $(dirname "$0")/conf/variables.sh

cat <<EOB
daemon off;
pid ./nginx.pid;
# user ${USER:-nginx};

events {
  worker_connections            1024;
  multi_accept                  on;
  accept_mutex_delay            50ms;
}

worker_rlimit_nofile            30000;

http {
  include                       /etc/nginx/conf/mime.types;
  default_type                  text/html;

  server_tokens                 off;
  underscores_in_headers        on;


  log_format simple             '\$status \$request_method \$uri\$query_params \$bytes_sent \$latency';

  access_log                    ./logs/access.log simple;
  error_log                     ./logs/error.log;

  # ELB/ALB is likely set to 60s; ensure we stay open at least that long
  keepalive_timeout             120;
  # send to upstream server
  proxy_send_timeout            10;
EOB

if [ "${IS_PROD}" ]
then
  cat <<EOB
  # receive from upstream server
  proxy_read_timeout            10;
EOB
else
  cat <<EOB
  # receive from upstream server
  proxy_read_timeout            30;
EOB
fi

cat <<EOB
  # send to client
  send_timeout                  10;

  set_real_ip_from              0.0.0.0/0;
  real_ip_header                X-Forwarded-For;
  real_ip_recursive             on;

  client_body_temp_path         './tmp/$(hostname)/client_body';
  fastcgi_temp_path             './tmp/$(hostname)/fastcgi';
  proxy_temp_path               './tmp/$(hostname)/proxy';
  scgi_temp_path                './tmp/$(hostname)/scgi';
  uwsgi_temp_path               './tmp/$(hostname)/uwsgi';

  large_client_header_buffers   4 64k;
  client_body_buffer_size       16k;
  client_header_buffer_size     64k;
  client_max_body_size          100m;
  proxy_buffering               on;
  proxy_buffers                 32 4k;
  proxy_busy_buffers_size       32k;
  proxy_max_temp_file_size      0;

  gzip                          on;
  gzip_comp_level               2;
  gzip_min_length               1400;
  gzip_proxied                  expired no-cache no-store private auth;
  gzip_types                    text/plain application/x-javascript application/json text/css text/javascript application/javascript application/octet-stream;

  server_names_hash_bucket_size 128;

  # statsd_server                 ${DATADOG_STATSD_HOST:-172.17.0.1}:${DATADOG_STATSD_PORT:-8125};

  # proxy_cache_path              './tmp/$(hostname)/cache/' levels=1:2 keys_zone=proxy:${CACHE_SIZE:-512m} max_size=${CACHE_MAX_SIZE:-100g} inactive=${CACHE_INACTIVE:-48h};
  # proxy_cache_key               \$scheme\$proxy_host\$request_uri;

EOB

if [ "${DNS_SERVER}" ]
then
  cat <<EOB
  resolver                      $DNS_SERVER;

EOB
fi

$(dirname "$0")/conf/maps.conf.sh

if [ "${IS_PROD}" ]
then
  PORT=8081 MODE=backup $(dirname "$0")/conf/environments/prod.conf.sh
  PORT=8082 MODE=cache $(dirname "$0")/conf/environments/prod.conf.sh
  PORT=8083 MODE=live $(dirname "$0")/conf/environments/prod.conf.sh
else
  PORT=8081 $(dirname "$0")/conf/environments/local.conf.sh
fi

cat <<EOB

  server {
    listen                      ${PORT:-8080};
    server_name                 _;
EOB

if [ "${IS_ADMIN}" != 'true' ]
then
  cat <<EOB

    if (\$http_x_forwarded_port = 80) {
      return                    301 '\${http_x_forwarded_proto}s://\${host}\${request_uri}\${query_params}';
    }

    if (\$request_method ~ ^(POST|PUT)$) {
      return                    405;
    }
EOB

  for endpoint in $(node -e "console.log(require('$(dirname "$0")/conf/private-endpoints.json').join(' '))")
  do
    cat <<EOB

    location ^~ $API_PREFIX/${endpoint##/} {
      return                    403;
    }
EOB
  done
fi

cat <<EOB

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

    location ${CONTEXT_PATH}/_ {
      rewrite                   ^${CONTEXT_PATH}/_(.*) ${API_PREFIX}\$1;
    }

    location @nodejs {
      rewrite                   ^${API_PREFIX}(/|$)(.*) /\$2 break;
      proxy_pass                http://0.0.0.0:${NODEJS_PORT:-9000}\$uri\$query_params;
      proxy_redirect            / ' ${API_PREFIX}/';
    }

    location ~ ^${API_PREFIX}/status/(\\d\\d\\d)$ {
      # nginx can't return dynamic status codes, so proxy to nodejs
      error_page                418 = @nodejs;
      return                    418;
    }
EOB

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

    location / {
      proxy_set_header          Host \$host;
      proxy_pass                http://\$mode;
    }
  }
}
EOB

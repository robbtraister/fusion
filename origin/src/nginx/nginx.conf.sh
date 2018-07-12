#!/bin/sh

CONTEXT_PATH="${CONTEXT_PATH:-pb}"
# strip trailing slash
CONTEXT_PATH="${CONTEXT_PATH%%/}"
# enforce leading slash
CONTEXT_PATH="/${CONTEXT_PATH##/}"

API_PREFIX="${CONTEXT_PATH}/api/v3"

IS_PROD=$(echo "${NODE_ENV}" | grep -i "^prod")

DNS_SERVER=''
for word in $(cat '/etc/resolv.conf')
do
  # the dns must be 4 segments of digits separated by '.'s
  dns=$(echo "${word}" | egrep '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
  if [ "${dns}"  ]
  then
    DNS_SERVER="${DNS_SERVER}${dns} "
  fi
done

if [ "${LAMBDA_ENGINE}" ]
then
  HTTP_ENGINE=''
else
  if [ ! "${HTTP_ENGINE}" ]
  then
    LAMBDA_ENGINE="arn:aws:lambda:${AWS_REGION:-us-east-1}:${AWS_ACCOUNT_ID:-397853141546}:function:fusion-engine-\${environment}"
  fi
fi

if [ "${LAMBDA_RESOLVER}" ]
then
  HTTP_RESOLVER=''
else
  if [ ! "${HTTP_RESOLVER}" ]
  then
    LAMBDA_RESOLVER="arn:aws:lambda:${AWS_REGION:-us-east-1}:${AWS_ACCOUNT_ID:-397853141546}:function:fusion-resolver-\${environment}"
  fi
fi

S3_HOST="http://${S3_BUCKET:-pagebuilder-fusion}.s3.amazonaws.com"

cat <<EOB
daemon off;
pid ./nginx.pid;
# user ${USER:-nginx};

events {
  worker_connections            1024;
  multi_accept on;
  accept_mutex_delay            50ms;
}

worker_rlimit_nofile            30000;

http {
  include                       /etc/nginx/conf/mime.types;
  default_type                  application/octet-stream;

  server_tokens                 off;
  underscores_in_headers        on;


  log_format simple             '\$status \$request_method \$uri\$query_params \$bytes_sent \$latency';

  access_log                    ./logs/access.log simple;
  error_log                     ./logs/error.log;

  # ELB/ALB is likely set to 60s; ensure we stay open at least that long
  keepalive_timeout             120;

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

  # proxy_cache_path              './tmp/$(hostname)/cache/' levels=1:2 keys_zone=proxy:${CACHE_SIZE:-512m} max_size=${CACHE_MAX_SIZE:-100g} inactive=${CACHE_INACTIVE:-48h};
  # proxy_cache_key               \$scheme\$proxy_host\$request_uri;

EOB

if [ "${DNS_SERVER}" ]
then
  cat <<EOB
  resolver                      $DNS_SERVER;

EOB
fi

cat <<EOB
  upstream rendering {
    server                      0.0.0.0:${RENDERING_PORT:-8081} max_conns=128;
    keepalive                   1;
  }

  # statsd_server               ${DATADOG_STATSD_HOST:-172.17.0.1}:${DATADOG_STATSD_PORT:-8125};

  geo \$dollar {
    default                     '\$';
  }

  map \$request_uri \$valid_request {
    ~[\{\}]                     'false';
    default                     'true';
  }

  map \$http_x_forwarded_host \$host_header {
    ''                          \$host;
    default                     \$http_x_forwarded_host;
  }

  map \$is_args \$query_params {
    '?'                         \$is_args\$args;
    default                     '';
  }

  # request_time is recorded in s with ms resolution; remove the '.' for ms
  map \$request_time \$latency_padded {
    ~^(?<i>\d*)\.(?<d>\d*)\$    \$i\$d ;
    default                     'NaN';
  }

  # this is just to cleanup stray 0 padding
  map \$latency_padded \$latency {
    '0000'                      '0';
    ~^0*(?<num>[^0].*)\$        \$num;
    default                     \$latency_padded;
  }

  map \$request_uri \$context_free_uri {
    ~*^${CONTEXT_PATH}/(.*)     /\$1;
    default                     \$request_uri;
  }

  map \$http_referer \$refererVersion {
    ~(\?|&)v=([0-9]+)(&|$)      \$2;
    default                     'production'; #'\${dollar}LATEST';
  }

  map \$cookie_version \$cookieVersion {
    default                     \$cookie_version;
    ''                          \$refererVersion;
  }

  map \$http_version \$headerVersion {
    default                     \$http_version;
    ''                          \$cookieVersion;
  }

  map \$arg_v \$version {
    default                     \$arg_v;
    ''                          \$headerVersion;
  }

  map \$host \$environment {
    default                     'localhost';
EOB
if [ "${IS_PROD}" ]
then
  cat <<EOB
    ~^(?<subdomain>[^.]+)\.     \$subdomain;
EOB
fi
cat <<EOB
  }

  map \$http_user_agent \$defaultOutputType {
    ~*(phone|mobile)            'mobile';
    default                     'default';
  }

  map \$arg_outputType \$outputType {
    default                     \$arg_outputType;
    ''                          \$defaultOutputType;
  }

  server {
    listen                      ${PORT:-8080};
    server_name                 _;

EOB

if [ "${IS_PROD}" ] && [ "${IS_ADMIN}" != 'true' ]
then
  cat <<EOB
    if (\$http_x_forwarded_port = 80) {
      return 301 '\${http_x_forwarded_proto}s://\${host}\${request_uri}\${query_params}';
    }

    if (\$request_method ~ ^(PUT|POST)$) {
      return 405;
    }
EOB

  for endpoint in $(node -e 'console.log(require("./private-endpoints.json").join(" "))')
  do
    cat <<EOB
    location ^~ $endpoint {
      return 403;
    }
EOB
  done
fi

cat <<EOB
    location @engine {
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
      proxy_set_header          'Content-Type' 'application/json';
      proxy_pass                ${LAMBDA_PROXY:-http://0.0.0.0:${NODEJS_PORT:-8081}}\$uri\$query_params;
EOB
fi

cat <<EOB
      proxy_redirect            / ' ${API_PREFIX}/';
    }

    location @resolver {
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
      proxy_set_header          'X-FunctionName' '${LAMBDA_RESOLVER}';
      proxy_set_header          'Content-Type' 'application/json';
      proxy_pass                ${LAMBDA_PROXY:-http://0.0.0.0:${NODEJS_PORT:-8081}}\$uri\$query_params;
EOB
fi

cat <<EOB
      proxy_redirect            /make/ ' ${CONTEXT_PATH}/';
      proxy_redirect            / ' ${API_PREFIX}/';
    }

    location @nodejs {
      rewrite                   ^${API_PREFIX}(/|$)(.*) /\$2 break;
      proxy_pass                http://0.0.0.0:${NODEJS_PORT:-8081}\$uri\$query_params;
      proxy_redirect            / ' ${API_PREFIX}/';
    }

    location @resources {
      return 404;
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(resources)(/.*|$) {
      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

EOB

if [ "${IS_PROD}" ]
then
  cat <<EOB
      set                       \$p \$2\$3;
      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/\$p;
      proxy_pass                \$target;
EOB
else
  cat <<EOB
      root                      /etc/nginx/resources;
      try_files                 \$3 =418;
EOB
fi

cat <<EOB
    }

    location ~ ^(${CONTEXT_PATH}|${API_PREFIX})/(assets|dist)(/.*|$) {
      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      if (\$request_method = 'POST' ) {
        return                  418;
      }
EOB

if [ "${IS_PROD}" ]
then
  cat <<EOB
      set                       \$p \$2\$3;
      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/\$p;
      proxy_pass                \$target;
EOB
else
  cat <<EOB
      root                      /etc/nginx/dist;
      try_files                 \$3 =418;
EOB
fi

cat <<EOB
    }

    location ~ ^${API_PREFIX}/(configs)(/.*|$) {
      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @engine;

      set                       \$p /components\$2/fusion.configs.json;
EOB

if [ "${IS_PROD}" ]
then
  cat <<EOB
      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/dist\$p;
      proxy_pass                \$target;
EOB
else
  cat <<EOB
  add_header   "Content-Type" "text/html";
      root                      /etc/nginx/dist;
      try_files                 \$p =418;
EOB
fi

cat <<EOB
    }

    location ~ ^${API_PREFIX}/(content|generate|render|resolvers)(/.*|$) {
      error_page                418 = @engine;
      return                    418;
    }

    # keep 'resolve' as a group, since the pattern is re-used elsewhere and the trailing endpoint is referenced as $2
    location ~ ^${API_PREFIX}/(resolve)(/.*|$) {
      error_page                418 = @resolver;
      return                    418;
    }

    location ~ ^${API_PREFIX}/(fuse|make)(/.*|$) {
      error_page                400 403 404 418 = @resolver;
      proxy_intercept_errors    on;

EOB

if [ "${ON_DEMAND}" == 'true' ] || [ ! "${IS_PROD}" ]
then
  cat <<EOB
      return                    418;
EOB
else
  cat <<EOB
      set                       \$p \$2.html;
      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/html/\${outputType}\$p;
      proxy_pass                \$target;
EOB
fi

cat <<EOB
    }

EOB

if [ "${PB_ADMIN}" ]
then
  cat <<EOB
    location ${CONTEXT_PATH}/admin {
      proxy_pass                ${PB_ADMIN};
    }
    location ${CONTEXT_PATH}/app/info {
      proxy_pass                ${PB_ADMIN};
    }
    location ${CONTEXT_PATH}/content/api {
      proxy_pass                ${PB_ADMIN};
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
      rewrite                   (.*) ${API_PREFIX}/resources/favicon.ico;
    }

    location = / {
      rewrite                   (.*) /homepage;
    }

    # admin rewrites
    # location = ${CONTEXT_PATH}/content/api/content-config {
    #   rewrite                   (.*) ${API_PREFIX}/configs/content/sources;
    # }
    #
    # location ~ ^${CONTEXT_PATH}/admin/api/(chain|feature|layout)-config/?$ {
    #   rewrite                   ^${CONTEXT_PATH}/admin/api/(chain|feature|layout)-config/? ${API_PREFIX}/configs/\$1s;
    # }
    #

    location ${API_PREFIX} {
      return                    404;
    }

    # all other requests should be treated as a new page to render
    location / {
      rewrite                   ^(${CONTEXT_PATH})?(.*) ${API_PREFIX}/make\$2;
    }
  }
}
EOB

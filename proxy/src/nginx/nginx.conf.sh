#!/bin/sh

DNS_SERVER=''
for word in $(cat '/etc/resolv.conf')
do
  # the dns must be 4 segments of digits separated by '.'s
  # ignore local DNS servers that start with 127.0.
  dns=$(echo "${word}" | egrep '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$' | grep -v '^127\.0\.')
  if [[ "${dns}"  ]]
  then
    DNS_SERVER="${DNS_SERVER}${dns} "
  fi
done

cat <<EOB
daemon off;
pid ./nginx.pid;
# user ${USER:-nginx};

events {
  worker_connections           1024;
  multi_accept on;
  accept_mutex_delay           50ms;
}

worker_rlimit_nofile           30000;

http {
  include                      /etc/nginx/conf/mime.types;
  default_type                 application/octet-stream;

  server_tokens                off;
  underscores_in_headers       on;


  log_format simple '\$status \$request_method \$uri\$query_params \$latency';

  access_log                   ./logs/access.log simple;
  error_log                    ./logs/error.log;

  # ELB/ALB is likely set to 60s; ensure we stay open at least that long
  keepalive_timeout            120;

  set_real_ip_from             0.0.0.0/0;
  real_ip_header               X-Forwarded-For;
  real_ip_recursive            on;

  client_body_temp_path        "./tmp/$(hostname)/client_body";
  fastcgi_temp_path            "./tmp/$(hostname)/fastcgi";
  proxy_temp_path              "./tmp/$(hostname)/proxy";
  scgi_temp_path               "./tmp/$(hostname)/scgi";
  uwsgi_temp_path              "./tmp/$(hostname)/uwsgi";

  large_client_header_buffers  4 64k;
  client_body_buffer_size      16k;
  client_header_buffer_size    64k;
  client_max_body_size         100m;
  proxy_buffering              on;
  proxy_buffers                32 4k;
  proxy_busy_buffers_size      32k;
  proxy_max_temp_file_size     0;

  gzip                         on;
  gzip_comp_level              2;
  gzip_min_length              1400;
  gzip_proxied                 expired no-cache no-store private auth;
  gzip_types                   text/plain application/x-javascript application/json text/css;

  server_names_hash_bucket_size 128;

  # proxy_cache_path "./tmp/$(hostname)/cache/" levels=1:2 keys_zone=proxy:${CACHE_SIZE:-512m} max_size=${CACHE_MAX_SIZE:-100g} inactive=${CACHE_INACTIVE:-48h};
  # proxy_cache_key \$scheme\$proxy_host\$request_uri;

EOB

if [ "${DNS_SERVER}" ]
then
  cat <<EOB
  resolver                     $DNS_SERVER;

EOB
fi

cat <<EOB
  upstream rendering {
    server 0.0.0.0:${RENDERING_PORT:-8081} max_conns=128;
    keepalive 1;
  }

  # statsd_server ${DATADOG_STATSD_HOST:-172.17.0.1}:${DATADOG_STATSD_PORT:-8125};

  map \$uri \$valid_request {
    ~[\{\}]                    'false';
    default                    'true';
  }

  map \$http_x_forwarded_host \$host_header {
    ""                         \$host;
    default                    \$http_x_forwarded_host;
  }

  map \$is_args \$query_params {
    '?'                        \$is_args\$args;
    default                    '';
  }

  # request_time is recorded in s with ms resolution; remove the '.' for ms
  map \$request_time \$latency_padded {
    ~^(?<i>\d*)\.(?<d>\d*)\$   \$i\$d ;
    default                    'NaN';
  }

  # this is just to cleanup stray 0 padding
  map \$latency_padded \$latency {
    '0000'                     '0';
    ~^0*(?<num>[^0].*)\$       \$num;
    default                    \$latency_padded;
  }

  map \$request_uri \$context_free_uri {
    ~^/${CONTEXT:-pb}/(.*)     /\$1;
    default                    \$request_uri;
  }

  map \$cookie_version \$cookieVersion {
    ''                         '${DEFAULT:-latest}';
    default                    \$cookie_version;
  }

  map \$http_version \$headerVersion {
    ''                         \$cookieVersion;
    default                    \$http_version;
  }

  map \$arg_v \$version {
    ''                         \$headerVersion;
    default                    \$arg_v;
  }

  map \$host \$environment {
    default                    '__default__';
    ~^(?<env>[^.]+)            \$env;
  }

  server {
    listen                     ${PORT:-8080};
    server_name                _;

    location @lambda {
      let \$status_class       \$status / 100 ;
      statsd_count             "fusion.proxy.requests#app:pagebuilder,nile_env:${NILE_ENV},valid:\$valid_request,status-code:\$status,status-class:\${status_class}xx" 1;
      statsd_timing            "fusion.proxy.latency#app:pagebuilder,nile_env:${NILE_ENV},valid:\$valid_request,status-code:\$status,status-class:\${status_class}xx" "\$request_time";

      # location block uses decoded uri, so must use 'if' on un-decoded request_uri
      if (\$valid_request = "false") {
        add_header             Content-Type text/html;
        return 400             "Invalid URL: \$request_uri";
      }

      proxy_read_timeout       20;
      proxy_send_timeout       20; # this should match arc-origin proxy_read_timeout

      proxy_ignore_headers     "X-Accel-Expires" "Expires" "Cache-Control" "Set-Cookie";

      # required for upstream keepalive
      proxy_http_version       1.1;
      proxy_set_header         Connection "";

      proxy_set_header         X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header         X-Forwarded-Host \$host_header;
      proxy_set_header         Host \$host_header;
      proxy_pass               http://rendering;
    }

    location @engine {
EOB
if [[ "${ENGINE_HANDLER}" ]]
then
  cat <<EOB
      proxy_pass               ${ENGINE_HANDLER};
EOB
else

  cat <<EOB
      proxy_set_header         'X-FunctionName' '${ENGINE_LAMBDA:-arn:aws:lambda:${AWS_REGION:-us-east-1}:${AWS_ACCOUNT_ID:-397853141546}:function:fusion-engine-\$\{environment\}-engine}';
      proxy_set_header         'Content-Type' 'application/json';
      proxy_pass               ${LAMBDA_PROXY:-http://0.0.0.0:${NODEJS_PORT:-8081}}\$context_free_uri\$is_args\$args;
EOB
fi
cat <<EOB
    }

    location @resolver {
EOB
if [[ "${RESOLVER_HANDLER}" ]]
then
  cat <<EOB
      proxy_pass               ${RESOLVER_HANDLER};
EOB
else
  cat <<EOB
      proxy_set_header         'X-FunctionName' '${RESOLVER_LAMBDA:-arn:aws:lambda:${AWS_REGION:-us-east-1}:${AWS_ACCOUNT_ID:-397853141546}:function:fusion-resolver-\$\{environment\}-resolver}';
      proxy_set_header         'Content-Type' 'application/json';
      proxy_pass               ${LAMBDA_PROXY:-http://0.0.0.0:${NODEJS_PORT:-8081}}\$context_free_uri\$is_args\$args;
EOB
fi
cat <<EOB
    }

    location @resources {
      return 404;
    }

    location ~ ^/${CONTEXT:-pb}/resources/(.*) {
      proxy_intercept_errors   on;
      error_page               400 403 404 418 = @resources;

      set \$target http://${S3_BUCKET:-${NILE_NAMESPACE:-fusion}}.s3.amazonaws.com/\${environment}/resources/\${version}/\$1;
      proxy_pass \$target;
    }

    # test paths for hitting the engine lambda
    location ~ ^/(content|render)(/.*|$) {
      error_page               418 = @engine;
      return                   418;
    }

    # test paths for hitting the resolver lambda
    location ~ ^/(resolve)(/.*|$) {
      error_page               418 = @resolver;
      return                   418;
    }

    location /health {
      access_log               off;
      add_header               Content-Type text/html;
      return                   200 'OK';
    }
  }
}
EOB

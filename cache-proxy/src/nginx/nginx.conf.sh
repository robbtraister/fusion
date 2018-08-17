#!/bin/sh

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


  log_format simple             '\$status \$request_method \$uri\$query_params \$bytes_sent \$latency \$upstream_addr';

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

  map \$arg_ttl \$cache_ttl {
    default                     300;
    ~([\d]*)                    \$1;
  }

  upstream cache_cluster {
    hash \$memc_key;
EOB
  for cache_node in $(echo $CACHE_NODES);
  do
cat <<EOB
      server $cache_node;
EOB
  done

cat <<EOB
  }

  server {
    listen                      ${PORT:-8080};
    server_name                 'Fusion Secure Cache';
    auth_basic                  "Fusion Secure Cache";
    auth_basic_user_file        /etc/nginx/conf/credentials;

    location /cache {
      set                       \$memc_key "\${remote_user}:\${arg_key}";
      error_page                418 = @cacheput;

      if (\$request_method = PUT) {
        return 418;
      }

      if (\$request_method = POST) {
        return 418;
      }

      memc_pass                 cache_cluster;
    }

    location @cacheput {
      set                       \$memc_key "\${remote_user}:\${arg_key}";
      set                       \$memc_exptime \$cache_ttl;
      memc_pass                 cache_cluster;
    }

    location = /healthcheck {
      auth_basic                off;
      access_log                off;
      add_header                Content-Type text/html;
      return                    200 'OK';
    }
  }
}

EOB
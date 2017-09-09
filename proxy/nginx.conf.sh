#!/bin/sh

cat <<EOF
daemon off;

pid ./nginx.pid;

worker_processes auto;

events {
  worker_connections 8096;
  multi_accept on;
}

worker_rlimit_nofile 30000;

http {
  server_tokens off;

  client_body_temp_path ./tmp/client_body;
  fastcgi_temp_path ./tmp/fastcgi;
  proxy_temp_path ./tmp/proxy;
  scgi_temp_path ./tmp/scgi;
  uwsgi_temp_path ./tmp/uwsgi;

  access_log ./logs/access.log;
  error_log ./logs/error.log;

  include /etc/nginx/mime.types;
  # underscores_in_headers on;
  # default_type  application/octet-stream;

  gzip             on;
  gzip_comp_level  5;
  gzip_min_length  1400;
  gzip_proxied     any;
  gzip_types       *;

  # resolver {{ DNS_SERVER }};
  # statsd_server 172.17.0.1:8125;

  proxy_cache_key \$uri\$is_args\$args;
  proxy_cache_path ./tmp/cache levels=1:2 keys_zone=cache:10m;
  proxy_cache_background_update on;
  proxy_cache_use_stale error timeout updating;
  proxy_cache_valid any 60m;

  server {
    listen ${PORT:-8080} default_server;
    server_name _;

    location ~ /_assets/(.*) {
      root .;
      try_files /dist/\$1 /resources/\$1 =404;
    }

    location / {
      proxy_cache cache;
      proxy_pass http://${TARGET};
    }
  }
}
EOF

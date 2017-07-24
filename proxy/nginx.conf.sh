cat <<EOF
daemon off;

pid ./nginx.pid;
error_log ./logs/error.log notice;

worker_processes auto;

events {
  worker_connections 8096;
  multi_accept on;
  use epoll;
}

worker_rlimit_nofile 30000;

http {
  server_tokens off;

  client_body_temp_path ./tmp/client_body;
  fastcgi_temp_path ./tmp/fastcgi;
  proxy_temp_path ./tmp/proxy;
  scgi_temp_path ./tmp/scgi;
  uwsgi_temp_path ./tmp/uwsgi;

  log_format fluentd  '\$remote_addr - \$remote_user [\$time_iso8601] '
                      '"\$request" \$status '
                      '\$body_bytes_sent \$http_content_length \$request_length '
                      '"\$query_string" "\$http_x_forwarded_for" '
                      '"\$http_referer" "\$http_user_agent"';
  access_log ./logs/access.log fluentd;

  include /etc/nginx/mime.types;
  underscores_in_headers on;
  large_client_header_buffers 4 64k;
  default_type  application/octet-stream;
  client_body_buffer_size 16k;
  client_header_buffer_size 64k;
  client_max_body_size 50m;
  client_body_timeout 12;
  client_header_timeout 12;
  keepalive_timeout 75;
  send_timeout 10;
  proxy_connect_timeout 5;
  proxy_read_timeout 10;
  proxy_send_timeout 10;
  proxy_buffering on;
  proxy_buffers 32 4k;
  proxy_busy_buffers_size 32k;
  proxy_max_temp_file_size 0;
  sendfile           on;
  tcp_nopush         on;
  tcp_nodelay        on;

  limit_req_log_level notice;

  gzip             on;
  gzip_comp_level  2;
  gzip_min_length  1400;
  gzip_proxied     expired no-cache no-store private auth;
  gzip_types       text/plain application/javascript application/x-javascript application/json text/css;

  server_names_hash_bucket_size 128;

  map \$request_method \$is_write_request {
    "GET" 0;
    "HEAD" 0;
    "OPTIONS" 0;
    default 1;
  }

  proxy_cache_path ./tmp/cache keys_zone=cache:10m levels=1:2 inactive=600s max_size=100m;

  server {
    listen ${NGINX_PORT} default_server;
    server_name _;

    proxy_cache cache;
    proxy_cache_lock on;
    proxy_cache_valid 0s;
    proxy_cache_use_stale updating;

    sendfile           on;
    sendfile_max_chunk 1m;

    location / {
      access_log off;
      etag off;
      proxy_pass http://0.0.0.0:8080;
    }

    location /favicon.ico {
      root ../resources;
      etag on;
    }

    location ~ ^/_/assets/(.*) {
      root ..;
      etag on;
      expires ${CACHE_MAX_AGE:-0};
      try_files /dist/\$1 /resources/\$1 =404;
    }
  }
}
EOF

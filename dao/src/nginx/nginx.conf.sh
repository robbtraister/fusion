#!/bin/sh

DNS_SERVER=''
for word in $(cat '/etc/resolv.conf')
do
  # the dns must be 4 segments of digits separated by '.'s
  dns=$(echo "${word}" | egrep '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
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
  default_type                 application/json;

  server_tokens                off;


  # log_format simple '\$status \$request_method \$uri\$query_params \$bytes_sent \$latency';

  access_log                   ./logs/access.log; # simple;
  error_log                    ./logs/error.log;

  keepalive_timeout            10;

  set_real_ip_from             0.0.0.0/0;
  real_ip_header               X-Forwarded-For;
  real_ip_recursive            on;

  client_body_temp_path        './tmp/$(hostname)/client_body';
  fastcgi_temp_path            './tmp/$(hostname)/fastcgi';
  proxy_temp_path              './tmp/$(hostname)/proxy';
  scgi_temp_path               './tmp/$(hostname)/scgi';
  uwsgi_temp_path              './tmp/$(hostname)/uwsgi';

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
  gzip_types                   application/json application/x-javascript text/javascript application/javascript;

  server_names_hash_bucket_size 128;

EOB

if [ "${DNS_SERVER}" ]
then
  cat <<EOB
  resolver                     $DNS_SERVER;

EOB
fi

for environment in $(cd ./conf/credentials && ls *.passwords | sed -e 's/\.passwords$//')
do
  subdomain=$(echo "${environment}" | awk '{ print tolower($0); }' | sed -e 's/_/-/')
  cat <<EOB

  server {
    listen                     ${PORT:-8080};
    server_name                ${subdomain}.*;

    auth_basic 'Fusion DAO Service';
    # this file reference is apparently relative to the config file, not the nginx pwd
    auth_basic_user_file ./credentials/${environment}.passwords;

    location /health {
      add_header 'Content-Type' 'text/plain';
      return 200 'OK';
    }

    location / {
      if (\$request_method != 'GET') {
        return 405;
      }

      proxy_set_header         'ARC_ORG_ENV' '${environment}';
      proxy_pass               http://0.0.0.0:${NODEJS_PORT:-8081};
    }
  }
EOB
done

cat <<EOB
  server {
    listen                     ${PORT:-8080} default_server;
    server_name                _;

    location /health {
      add_header 'Content-Type' 'text/plain';
      return 200 'OK';
    }

    location / {
      return 404;
    }
  }
}
EOB

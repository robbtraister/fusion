#!/bin/sh

(
  cd $(dirname "$0")

  if [[ $NGINX_PORT ]]
  then
    ./nginx.conf.sh > ./nginx.conf
    nginx -p ./ -c ./nginx.conf
  fi
)

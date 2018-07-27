#!/bin/sh

cd /etc/nginx

compile() {
  ./src/nginx/nginx.conf.sh > ./conf/nginx.conf
  
  # compile password file from env variables
  echo "computing credential file"
  for credentials in $(echo $CACHE_PROXY_CREDENTIALS); 
  do
    echo "encrypting for $credentials"
    htpasswd_credentials=$(echo $credentials | sed  "s/\([a-zA-Z0-9]\+\):\([a-zA-Z0-9]\+\)/\1 \2/")
    echo "credentials $htpasswd_credentials"
    htpasswd -nbm $htpasswd_credentials | head -c -1  >> ./conf/credentials
  done
}

test() {
  compile && nginx -t -p ./ -c ./conf/nginx.conf
}

start() {
  test && \
    (
      nginx -p ./ -c ./conf/nginx.conf \
    )
}

reload() {
  echo "reloading"
  test && nginx -p ./ -c ./conf/nginx.conf -s reload
}

watch() {
  MOD_FILE=$(mktemp)
  LOOP_FILE=$(mktemp)

  touch "${MOD_FILE}"

  while [ true ]
  do
    touch "${LOOP_FILE}"
    if [ $(find ./src/nginx -type f -newer "${MOD_FILE}") ]
    then
      mv -f "${LOOP_FILE}" "${MOD_FILE}"
      reload
    fi
    sleep ${SLEEP:-1}
  done
}

mkdir -p "./tmp/$(hostname)"

if [ ! "$(echo "${NODE_ENV}" | grep -i "^prod")" ]
then
  watch &
fi
start

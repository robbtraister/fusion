#!/bin/sh

cd /etc/nginx

compile() {
  ./src/nginx/nginx.conf.sh > ./conf/nginx.conf
}

test() {
  compile && nginx -t -p ./ -c ./conf/nginx.conf
}

start() {
  ./src/init.js &&
  test && (
    PORT=${NODEJS_PORT:-8081} node ./src/nodejs/cluster &
    nginx -p ./ -c ./conf/nginx.conf
  )
}

reload() {
  test && nginx -p ./ -c ./conf/nginx.conf -s reload
}

watch() {
  MOD_FILE=$(mktemp)
  LOOP_FILE=$(mktemp)

  touch "${MOD_FILE}"

  while [ true ]
  do
    touch "${LOOP_FILE}"
    if [ $(find ./src -type f -newer "${MOD_FILE}") ]
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

#!/bin/sh

set

compile() {
  ./src/nginx.conf.sh > ./conf/nginx.conf
}

test() {
  compile && nginx -t -p ./ -c ./conf/nginx.conf
}

start() {
  test && \
    (
      PORT=8081 node ./src/cluster & \
      nginx -p ./ -c ./conf/nginx.conf \
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

if [ "${WATCH}" == 'true' ]
then
  watch &
fi
start

#!/bin/sh

compile() {
  ./conf.d/nginx.conf.sh > ./nginx.conf
}

test() {
  compile && nginx -t -p ./ -c ./nginx.conf
}

start() {
  test && nginx -p ./ -c ./nginx.conf
}

reload() {
  test && nginx -p ./ -c ./nginx.conf -s reload
}

watch() {
  MOD_FILE=$(mktemp)
  LOOP_FILE=$(mktemp)

  touch "${MOD_FILE}"

  while [ true ]
  do
    touch "${LOOP_FILE}"
    if [ $(find ./conf.d -type f -newer "${MOD_FILE}") ]
    then
      mv -f "${LOOP_FILE}" "${MOD_FILE}"
      reload
    fi
    sleep ${SLEEP:-1}
  done
}

if [ $WATCH == 'true' ]
then
  watch &
fi

start

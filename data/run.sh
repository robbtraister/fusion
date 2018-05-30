#!/bin/sh

restoreFromDir() {
  DIR_NAME=$1
  # allow for hard-coded DB_NAME env var
  DB_NAME=${DB_NAME:-${DIR_NAME}}
  echo "restoring data into ${DB_NAME}..."
  mongorestore -d "${DB_NAME}" --drop "./${DIR_NAME}"
  rm -rf "./${DIR_NAME}"
  echo "${DB_NAME} restored."
}

restore() {
  (
    cd /data/restore
    directories=$(ls -d */ 2> /dev/null)
    if [ "$directories" ]
    then
      flush="true"
      for directory in $directories
      do
        restoreFromDir "${directory%%/}"
      done
    fi

    tarballs=$(ls *.tar.gz 2> /dev/null)
    if [ "$tarballs" ]
    then
      flush="true"
      for tarball in $tarballs
      do
        FILE_NAME="${tarball%%.tar.gz}"
        rm -rf "./${FILE_NAME}"
        mkdir -p "./${FILE_NAME}"
        tar xf ${tarball} --strip-components 1 -C "./${FILE_NAME}"

        restoreFromDir "${FILE_NAME}"

        rm -rf ${tarball}
      done
    fi

    # if [ "$flush" ]
    # then
    #   echo 'flushing cache...'
    #   for p in `seq 7000 7007`
    #   do
    #     echo flushall | nc cache $p
    #   done
    #   echo flush_all | nc cache 11211
    #   echo 'done.'
    # fi
  )
}

watch() {
  while [ true ]
  do
    restore
    sleep ${SLEEP:-1}
  done
}

mongod --fork --logpath /dev/stdout
restore
mongod --shutdown

if [ "$WATCH" = 'true' ]
then
  watch &
fi
mongod

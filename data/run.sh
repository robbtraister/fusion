#!/bin/sh

restore() {
  (
    cd /data/restore
    directories=$(ls -d */ 2> /dev/null)
    if [ "$directories" ]
    then
      flush="true"
      for directory in $directories
      do
        DB_NAME="${directory%%/}"
        echo "restoring data into ${DB_NAME}..."
        mongorestore -d "${DB_NAME}" --drop "./${DB_NAME}"
        rm -rf "./${DB_NAME}"
        echo "${DB_NAME} restored."
      done
    fi

    tarballs=$(ls *.tar.gz 2> /dev/null)
    if [ "$tarballs" ]
    then
      flush="true"
      for tarball in $tarballs
      do
        DB_NAME="${tarball%%.tar.gz}"
        echo "restoring data into ${DB_NAME}..."
        rm -rf "./${DB_NAME}"
        mkdir -p "./${DB_NAME}"
        tar xf ${tarball} --strip-components 1 -C "./${DB_NAME}"
        mongorestore -d "${DB_NAME}" --drop "./${DB_NAME}"
        rm -rf "./${DB_NAME}"
        rm -rf ${tarball}
        echo "${DB_NAME} restored."
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

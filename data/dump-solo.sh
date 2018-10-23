#!/bin/sh

mongod --fork --logpath /dev/stdout
(
  cd /data/dumps
  now=$(date '+%Y-%m-%d-%H-%M-%S')
  DUMP_DIR="./${now}"
  mkdir -p "${DUMP_DIR}"
  mongodump -o "${DUMP_DIR}" --db "${DB_NAME}"
  TARBALL="${DUMP_DIR}.tar.gz"
  tar -C "${DUMP_DIR}/${DB_NAME}" -czvf "${TARBALL}" ./
  rm -rf "${DUMP_DIR}"
)
mongod --shutdown

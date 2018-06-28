#!/bin/sh

now=$(date '+%Y-%m-%d-%H-%M-%S')
(
  cd /data/dumps
  DUMP_DIR="./${now}"
  mkdir -p "${DUMP_DIR}"
  mongodump -o "${DUMP_DIR}" --db "${DB_NAME}"
  TARBALL="${DUMP_DIR}.tar.gz"
  tar -C "${DUMP_DIR}/${DB_NAME}" -czvf "${TARBALL}" ./
  rm -rf "${DUMP_DIR}"
)

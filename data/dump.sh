#!/bin/sh

DUMP_DIR=$(mktemp -d)
mongodump -o "${DUMP_DIR}" --db "${DB_NAME}" > /dev/null
TEMP_FILE=$(mktemp)
TARBALL="${TEMP_FILE}.tar.gz"
rm -rf "${TEMP_FILE}"
tar -C "${DUMP_DIR}/${DB_NAME}" -czvf "${TARBALL}" ./ > /dev/null
rm -rf "${DUMP_DIR}"
echo "${TARBALL}"

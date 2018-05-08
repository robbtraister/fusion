'use strict'

const promises = require('../utils/promises')

const archiveType = configs => ({
  isArchiveFile: fp => promises.exec(`hexdump -e '"%x"' -n ${configs.n} "${fp}"`)
    .then(archiveHeader => archiveHeader === configs.header),
  extension: configs.extension
})

const ARCHIVE_TYPES = {
  ZIPFILE: archiveType({n: 4, header: '4034b50', extension: '.zip'}),
  TARBALL: archiveType({n: 2, header: '8b1f', extension: '.tar.gz'})
}

const getArchiveType = fp => Promise.all(
  Object.keys(ARCHIVE_TYPES)
    .map(archiveType => ARCHIVE_TYPES[archiveType].isArchiveFile(fp).then(is => is && ARCHIVE_TYPES[archiveType]))
)
  .then(archiveTypeMap => archiveTypeMap.find(archiveType => archiveType))

function extract (fp, remove) {
  return promises.tempDir()
    .then(rootDir => {
      return getArchiveType(fp)
        .then(t => {
          return (t === ARCHIVE_TYPES.ZIPFILE)
            ? promises.exec(`unzip -q '${fp}' -d '${rootDir}'`)
            : (t === ARCHIVE_TYPES.TARBALL)
              ? promises.exec(`tar zxf '${fp}' --strip-components 1 -C '${rootDir}'`)
              : Promise.reject(new Error('UNRECOGNIZED_FILE_TYPE'))
        })
        .then(() => {
          return (remove)
            ? promises.exec(`rm -rf '${fp}'`)
            : null
        })
        .then(() => Promise.all([
          promises.glob('**/*', {cwd: rootDir, nodir: true}),
          promises.glob('**/*/', {cwd: rootDir})
        ]))
        .then(([files, directories]) => ({
          rootDir,
          files,
          directories
        }))
    })
}

module.exports = extract

if (module === require.main) {
  extract(process.argv[2])
    .then(console.log)
    .catch(console.error)
}

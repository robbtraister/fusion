'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')
const yazl = require('yazl')

const debug = require('debug')('fusion:compiler:zip')

const promises = require('../utils/promises')

async function zip (zipDirMap) {
  const zipFile = await promises.tempFile()

  try {
    if (!(zipDirMap instanceof Object)) {
      zipDirMap = { '.': zipDirMap }
    }

    debug(`zipping ${Object.values(zipDirMap)} to ${zipFile}`)
    const zipfile = new yazl.ZipFile()
    const output = fs.createWriteStream(zipFile)

    await new Promise((resolve, reject) => {
      output.on('close', resolve)
      output.on('error', reject)
      zipfile.on('error', reject)

      zipfile.outputStream.pipe(output)

      function addDir (zipDir, prefix) {
        debug(`adding ${zipDir} to ${zipFile}`)
        return new Promise((resolve, reject) => {
          glob('**/*', { cwd: zipDir, nodir: true }, (err, files) => {
            if (err) {
              reject(err)
            } else {
              files.forEach((f) => zipfile.addFile(path.resolve(zipDir, f), prefix ? path.join(prefix, f) : f))
              resolve()
            }
          })
        })
      }

      Promise.all(Object.keys(zipDirMap).map((prefix) => addDir(zipDirMap[prefix], prefix)))
        .then(() => { zipfile.end() })
    })

    debug(`zipped ${Object.values(zipDirMap)} to ${zipFile}`)

    return zipFile
  } finally {
    promises.remove(zipFile)
  }
}

module.exports = zip

if (module === require.main) {
  zip()
    .then(console.log)
    .catch(console.error)
}

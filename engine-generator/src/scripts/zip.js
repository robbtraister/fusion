'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')
const yazl = require('yazl')

const debug = require('debug')('fusion:engine-generator:zip')

async function zip (zipFile, zipDirs) {
  if (!(zipDirs instanceof Array)) {
    zipDirs = [zipDirs]
  }

  debug(`zipping ${zipDirs} to ${zipFile}`)
  const zipfile = new yazl.ZipFile()
  const output = fs.createWriteStream(zipFile)

  await new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
    zipfile.on('error', reject)

    zipfile.outputStream.pipe(output)

    function addDir (zipDir) {
      debug(`adding ${zipDir} to ${zipFile}`)
      return new Promise((resolve, reject) => {
        glob('**/*', {cwd: zipDir, nodir: true}, (err, files) => {
          if (err) {
            reject(err)
          } else {
            files.forEach((f) => zipfile.addFile(path.resolve(zipDir, f), f))
            resolve()
          }
        })
      })
    }

    Promise.all(zipDirs.map(addDir))
      .then(() => { zipfile.end() })
  })

  debug(`zipped ${zipDirs} to ${zipFile}`)

  return zipFile
}

module.exports = zip

if (module === require.main) {
  zip()
    .then(console.log)
    .catch(console.error)
}

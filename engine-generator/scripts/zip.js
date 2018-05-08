'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')
const yazl = require('yazl')

const debug = require('debug')('fusion:engine-generator:zip')

function zip (zipFile, zipDir) {
  debug(`zipping ${zipDir} to ${zipFile}`)
  const zipfile = new yazl.ZipFile()
  const output = fs.createWriteStream(zipFile)

  return new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
    zipfile.on('error', reject)

    zipfile.outputStream.pipe(output)

    glob('**/*', {cwd: zipDir, nodir: true}, (err, files) => {
      if (err) {
        reject(err)
      } else {
        files.forEach((f) => zipfile.addFile(path.resolve(zipDir, f), f))
        zipfile.end()
      }
    })
  })
    .then(() => {
      debug(`zipped ${zipDir} to ${zipFile}`)
      return zipFile
    })
}

module.exports = zip

if (module === require.main) {
  zip()
    .then(console.log)
    .catch(console.error)
}

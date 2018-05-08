'use strict'

const fs = require('fs')
const path = require('path')

const yauzl = require('yauzl')

const debug = require('debug')('fusion:engine-generator:extract')

const promises = require('../utils/promises')

function extract (fp, dest) {
  debug(`extracting ${fp} to ${dest}`)
  return new Promise((resolve, reject) => {
    yauzl.open(fp, {lazyEntries: true}, (err, zipfile) => {
      if (err) {
        return reject(err)
      }

      zipfile.on('entry', function (entry) {
        if (/\/$/.test(entry.fileName)) {
          // Directory file names end with '/'.
          // Note that entries for directories themselves are optional.
          // An entry's fileName implicitly requires its parent directories to exist.
          zipfile.readEntry()
        } else {
          // file entry
          const destFile = path.resolve(dest, entry.fileName)
          promises.mkdirp(path.dirname(destFile))
            .then(() => {
              zipfile.openReadStream(entry, function (err, readStream) {
                if (err) {
                  return reject(err)
                }

                readStream.on('end', function () {
                  zipfile.readEntry()
                })

                readStream.pipe(fs.createWriteStream(destFile))
              })
            })
        }
      })

      zipfile.on('close', function () {
        debug(`extracted ${fp} to ${dest}`)
        resolve()
      })

      zipfile.readEntry()
    })
  })
}

module.exports = extract

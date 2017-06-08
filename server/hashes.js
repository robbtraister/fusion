'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const glob = require('glob')

const baseDir = path.normalize(`${__dirname}/../public`)

function generateHash (fp) {
  let hash = crypto.createHash(process.env.HASH_ALGORITHM || 'md5')
  hash.update(fs.readFileSync(fp))
  return hash.digest().toString('hex').slice(0, process.env.HASH_LENGTH || 12)
}

function generateKey (fp) {
  return fp.slice(baseDir.length)
}

const hashes = {}
glob.sync(`${baseDir}/**/*`)
  .forEach(fp => {
    hashes[generateKey(fp)] = generateHash(fp)
  })

module.exports = hashes

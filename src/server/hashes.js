'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const debug = require('debug')(`fusion:hashes:${process.pid}`)
const glob = require('glob')

const distDir = path.join(__dirname, '..', '..', 'dist')

function generateHash (fp) {
  let hash = crypto.createHash(process.env.HASH_ALGORITHM || 'md5')
  hash.update(fs.readFileSync(fp))
  return hash.digest().toString('hex').slice(0, process.env.HASH_LENGTH || 12)
}

function generateKey (fp) {
  return fp.slice(distDir.length)
}

const hashes = {}
glob.sync(`${distDir}/**/*`, {nodir: true})
  .forEach(fp => {
    hashes[generateKey(fp)] = generateHash(fp)
  })

debug(hashes)

module.exports = hashes

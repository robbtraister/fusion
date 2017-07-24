'use strict'

const fs = require('fs')
const path = require('path')

const debug = require('debug')(`fusion:controllers:content:${process.pid}`)

const Resolver = require('./resolver')

const base = path.join(__dirname, '..', '..', '..', 'content')

function fetch (uri) {
  let s = Resolver.contentURI(uri)
  debug('content source:', s)
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(base, `${s}.json`), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .catch(err => {
      debug('content fetch error:', err)
      throw err
    })
}

module.exports.fetch = fetch
module.exports.resolve = Resolver.contentURI

'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const debug = require('debug')(`fusion:controllers:content:${process.pid}`)

const promisify = require('./promisify')

const readFile = promisify(fs.readFile)
const base = path.join(__dirname, '..', '..', '..', 'content')

function fetch (uri) {
  let s = resolve(uri)
  debug('content source:', s)
  return readFile(path.join(base, `${s}.json`))
    .catch(err => {
      debug('content fetch error:', err)
      throw err
    })
}

function resolve (uri) {
  let p = url.parse(uri).pathname.replace(/^\//, '').replace(/\.js(onp?)?$/, '')
  debug('content path:', p)
  return `${p || 'homepage'}`
}

module.exports = fetch
module.exports.fetch = fetch
module.exports.resolve = resolve

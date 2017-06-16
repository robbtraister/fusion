'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const debug = require('debug')(`fusion:layouts:${process.pid}`)
const express = require('express')

const promisify = require('./promisify')

const readFile = promisify(fs.readFile.bind(fs))
const base = path.join(__dirname, '..', '..', 'layouts')

function source (uri) {
  let p = url.parse(uri).pathname.replace(/^\//, '').replace(/\.json$/, '')
  debug('path:', p)
  return `${['', 'homepage'].indexOf(p) >= 0 ? 'homepage' : 'article'}.json`
}

function fetch (uri) {
  let s = source(uri)
  debug('source:', s)
  return readFile(path.join(base, s))
    .catch(err => {
      debug('fetch error:', err)
      throw err
    })
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    fetch(req.path)
      .then(res.send.bind(res))
      .catch(err => {
        next({
          status: err.code === 'ENOENT' ? 404 : 500,
          msg: err
        })
      })
  })

  return router
}

module.exports = router
module.exports.fetch = fetch
module.exports.source = source

'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const debug = require('debug')(`pb:content:${process.pid}`)
const express = require('express')

const base = path.join(__dirname, '..', 'content')

function source (uri) {
  let f = url.parse(uri).pathname.replace(/^\//, '').replace(/\.json$/, '')
  return `${f || 'homepage'}.json`
}

function fetch (uri, cb) {
  fs.readFile(path.join(base, source(uri)), (err, buf) => {
    if (err) {
      debug('fetch error:', err)
      return cb(err)
    }
    cb(null, buf)
  })
}

function router () {
  let router = express.Router()

  router.use(express.static(path.join(__dirname, '..', 'content')))

  router.use((req, res, next) => {
    fetch(req.path, (err, content) => {
      if (err) {
        return next({
          status: err.code === 'ENOENT' ? 404 : 500,
          msg: err
        })
      }
      res.send(content)
    })
  })

  return router
}

module.exports = router
module.exports.fetch = fetch
module.exports.source = source

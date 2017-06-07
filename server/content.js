'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const debug = require('debug')('pb:content')
const express = require('express')

const base = path.join(__dirname, '..', 'content')

function fetch (uri, cb) {
  let f = url.parse(uri).pathname.replace(/^\//, '').replace(/\.jsonp?$/, '')
  fs.readFile(path.join(base, `${f}.json`), (err, buf) => {
    if (err) {
      debug('fetch error:', err)
      return cb(err)
    }
    cb(null, buf)
  })
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    fetch(req.path, (err, content) => {
      if (err) {
        return next({
          status: 500,
          msg: err
        })
      }
      if (/\.jsonp$/.test(req.path)) {
        res.send(`var ${(req.query.v || 'v').replace(/[^a-z_]*/gi, '')} = ${content}`)
      } else {
        res.send(content)
      }
    })
  })

  return router
}

module.exports = router
module.exports.fetch = fetch

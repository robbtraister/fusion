'use strict'

const fs = require('fs')
const path = require('path')
const url = require('url')

const debug = require('debug')(`fusion:content:${process.pid}`)
const express = require('express')

const promisify = require('./promisify')

const readFile = promisify(fs.readFile)
const base = path.join(__dirname, '..', '..', 'content')

const jsMask = /^[_$a-z][_$a-z0-9]*/i

function source (uri) {
  let p = url.parse(uri).pathname.replace(/^\//, '').replace(/\.js(onp?)?$/, '')
  debug('content path:', p)
  return `${p || 'homepage'}`
}

function fetch (uri) {
  let s = source(uri)
  debug('content source:', s)
  return readFile(path.join(base, `${s}.json`))
    .catch(err => {
      debug('content fetch error:', err)
      throw err
    })
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    fetch(req.path)
      .then(content => {
        if (/\.jsonp$/.test(req.path)) {
          let varName = jsMask.exec(req.query.v || '') || 'v'
          content = `/**/;var ${varName}=${content};`
        } else if (/\.js$/.test(req.path)) {
          let fcnName = jsMask.exec(req.query.f || '') || 'f'
          content = `/**/;${fcnName}(${content});`
        }
        return content
      })
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

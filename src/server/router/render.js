'use strict'

const debug = require('debug')(`fusion:render:${process.pid}`)

const express = require('express')

const Cache = require('../controllers/cache')
const Render = require('../controllers/render')

function hasQueryParam (query, q) {
  return query.hasOwnProperty(q) && ['false', '0'].indexOf(query[q]) < 0
}

function getRenderingOptions (query) {
  debug('query:', query)

  if (hasQueryParam(query, 'norender')) {
    return {
      hydrate: false,
      includeScripts: true
    }
  } else if (hasQueryParam(query, 'noscript')) {
    return {
      hydrate: true,
      includeScripts: false
    }
  }

  return {
    hydrate: true,
    includeScripts: true
  }
}

function errHandler (err, next) {
  next({
    status: 500,
    message: err.message,
    stack: err.stack
  })
}

function clear () {
  let router = express.Router()

  router.route('*')
    .post((req, res, next) => {
      Cache.clear(req.query.uri)
        .then(res.send.bind(res))
        .catch(err => {
          if (err.code === 'ENOENT') {
            res.sendStatus(404)
          } else {
            errHandler(err, next)
          }
        })
    })
    .get((req, res, next) => {
      res.sendStatus(405)
    })

  return router
}

function render () {
  return function renderMiddleware (req, res, next) {
    let uri = req.path

    Cache.read(uri)
      .then(res.send.bind(res))
      .catch(err => {
        if (err.code === 'ENOENT') {
          return Render(uri, getRenderingOptions(req.query))
            .then(data => {
              res.send(data)
              Cache.write(uri, data)
            })
        } else {
          errHandler(err, next)
        }
      })
  }
}

module.exports = render
module.exports.clear = clear
module.exports.render = render

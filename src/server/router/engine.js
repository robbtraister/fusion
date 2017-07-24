'use strict'

const url = require('url')

const debug = require('debug')(`fusion:routers:engine:${process.pid}`)

const Resolver = require('../controllers/resolver')

function router () {
  return function engineMiddleware (req, res, next) {
    let uri = url.parse(req.query.uri || req.path).pathname
    debug('Engine URI:', uri)

    let engine = Resolver.engine(uri)
    debug('Engine:', engine)

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    res.redirect(302, `/_/assets/engine/${engine}.js`)
  }
}

module.exports = router
module.exports.router = router

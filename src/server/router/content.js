'use strict'

const url = require('url')

const debug = require('debug')(`fusion:routers:content:${process.pid}`)

const Content = require('../controllers/content')
const Render = require('../controllers/render')

const jsMask = /^[_$a-z][_$a-z0-9]*/i

function router () {
  return function contentMiddleware (req, res, next) {
    let uri = url.parse(req.query.uri || req.path).pathname
    debug('Content URI:', uri)

    if (req.query.all === 'true') {
      Render.content(uri)
        .then(res.send.bind(res))
    } else {
      Content.fetch(uri)
        .then(content => {
          if (/\.js$/.test(uri) || req.query.f) {
            let fcnName = jsMask.exec(req.query.f || '') || 'f'
            content = `/**/;${fcnName}(${content});`
          } else if (/\.jsonp$/.test(uri) || req.query.v) {
            let varName = jsMask.exec(req.query.v || '') || 'v'
            content = `/**/;var ${varName}=${content};`
          }
          return content
        })
        .then(res.send.bind(res))
        .catch(err => {
          next({
            status: err.code === 'ENOENT' ? 404 : 500,
            message: err.message,
            stack: err.stack
          })
        })
    }
  }
}

module.exports = router
module.exports.router = router

'use strict'

const debug = require('debug')(`fusion:render:${process.pid}`)
const express = require('express')

const Render = require('../controllers/render')

function getRenderingOptions (query) {
  debug('query:', query)

  function hasQueryParam (q) {
    return query.hasOwnProperty(q) && ['false', '0'].indexOf(query[q]) < 0
  }

  if (hasQueryParam('norender')) {
    return {
      hydrate: false,
      includeScripts: true
    }
  } else if (hasQueryParam('noscript')) {
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

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    function errHandler (err) {
      next({
        status: 500,
        message: err.message,
        stack: err.stack
      })
    }

    Render(req.path, getRenderingOptions(req.query))
      .then(res.send.bind(res))
      .catch(errHandler)
  })

  return router
}

module.exports = router
module.exports.router = router

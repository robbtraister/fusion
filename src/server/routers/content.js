'use strict'

// const debug = require('debug')(`fusion:routers:content:${process.pid}`)
const express = require('express')

const controller = require('../controllers/content')

const jsMask = /^[_$a-z][_$a-z0-9]*/i

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    controller.fetch(req.path)
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
module.exports.router = router

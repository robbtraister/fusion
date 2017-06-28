'use strict'

const path = require('path')

const express = require('express')
const debug = require('debug')(`fusion:templates:${process.pid}`)

function get (uri) {
  let template = 'Article'
  if (/^\/(homepage\/?)?$/i.test(uri)) {
    template = 'Homepage'
  }
  debug('template:', template)
  return template
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    try {
      let p = path.normalize(`${__dirname}/../../dist/${get(req.path).toLowerCase()}.js`)
      debug('template path:', p)
      res.sendFile(p)
    } catch (err) {
      next({
        status: err.code === 'ENOENT' ? 404 : 500,
        msg: err
      })
    }
  })

  return router
}

module.exports = router
module.exports.get = get

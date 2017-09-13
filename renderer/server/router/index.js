'use strict'

const express = require('express')

const debug = require('debug')('server:router')

const render = require('../controllers/render')
const resolve = require('../controllers/resolve')

function router () {
  const router = express.Router()

  if (!/^prod/i.test(process.env.NODE_ENV)) {
    router.use('/_assets', require('./assets')())
  }
  router.use('/_content', require('./content')())
  router.use('/_template', require('./template')())

  router.get('*', (req, res, next) => {
    resolve(req.path)
      .then(data => {
        debug(data)
        data.content
          ? render(data.template)(data.content)(req, res, next)
          : next()
      })
      .catch(next)
  })

  router.get('*', render('404.jsx', 404)())

  return router
}

module.exports = router

'use strict'

const express = require('express')

module.exports = (env) => {
  const router = express.Router()

  router.use(require('./permissions')(env))

  router.use((req, res, next) => {
    req.arcSite = req.get('Arc-Site') || req.query._website
    next()
  })

  router.use(['/assets', '/dist'], require('./assets')(env))
  router.use('/configs', require('./configs')(env))
  router.use('/content', require('./content')(env))
  router.use('/properties', require('./properties')(env))
  router.use('/render', require('./render')(env))
  router.use('/resources', require('./resources')(env))

  return router
}

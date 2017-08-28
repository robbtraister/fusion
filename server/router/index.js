'use strict'

const express = require('express')

// const Content = require('../controllers/content')
// const Template = require('../controllers/template')
const Render = require('../controllers/render')
const Resolver = require('../controllers/resolver')

function router () {
  const router = express.Router()

  router.use('/_assets', require('./assets')())
  router.use('/_content', require('./content')())
  router.use('/_template', require('./template')())

  // router.get('/hbs', render('template.hbs')())
  // router.get('/jsx', render('template.jsx')())
  // router.get('/vue', render('template.vue')())

  router.get('*', (req, res, next) => {
    Resolver(req.path)
      .then(data => {
        data.content
          ? Render(data.template)(data.content)(req, res, next)
          : next()
      })
      .catch(next)
  })

  router.get('*', Render('404.jsx', 404)())

  return router
}

module.exports = router

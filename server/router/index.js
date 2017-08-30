'use strict'

const express = require('express')

// const Content = require('../controllers/content')
// const Template = require('../controllers/template')
const Resolver = require('../controllers/resolver')

const render = (template, status) => data => (req, res, next) => {
  if (status) {
    res.status(status)
  }

  data = data || {}
  const uri = req.path
  Object.assign(data, {uri})

  res.render(template, data, (err, html) => {
    if (err) {
      return next(err)
    }
    res.send(html)
  })
}

function router () {
  const router = express.Router()

  router.use('/_assets', require('./assets')())
  router.use('/_content', require('./content')())
  router.use('/_template', require('./template')())

  router.get('*', (req, res, next) => {
    Resolver(req.path)
      .then(data => {
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

'use strict'

const express = require('express')

const Content = require('../controllers/content')
// const Resolver = require('../controllers/resolver')

function router () {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    Content(req.path)
      .then(content => {
        if (content) {
          if (req.query.f) {
            res.send(`${req.query.f}(${JSON.stringify(content)})`)
          } else {
            res.send(content)
          }
        } else {
          res.sendStatus(404)
        }
      })
      .catch(next)
  })

  return router
}

module.exports = router

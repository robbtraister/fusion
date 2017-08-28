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
          const f = req.query.f || 'f'
          res.send(`${f}(${JSON.stringify(content)})`)
        } else {
          res.sendStatus(404)
        }
      })
      .catch(next)
  })

  return router
}

module.exports = router

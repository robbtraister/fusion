'use strict'

const express = require('express')

const Content = require('../controllers/content')
// const Resolver = require('../controllers/resolver')

const jsMask = /^[_$a-z][_$a-z0-9]*/i

function router () {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    Content(req.path)
      .then(content => {
        if (content) {
          content = JSON.stringify(content)
          if (req.query.f) {
            let fcnName = jsMask.exec(req.query.f) || 'f'
            content = `/**/;${fcnName}(${content});`
          } else if (req.query.v) {
            let varName = jsMask.exec(req.query.v) || 'v'
            content = `/**/;var ${varName}=${content};`
          }
          res.send(content)
        } else {
          res.sendStatus(404)
        }
      })
      .catch(next)
  })

  return router
}

module.exports = router

'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')

const jsMask = /^[_$a-z][_$a-z0-9]*$/i

function router () {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    const isFcn = !!req.query.f
    const field = isFcn ? req.query.f : req.query.v

    if (field && !jsMask.test(field)) {
      res.status(400).send('Invalid JSONP field')
      return
    }

    resolve(req.path)
      .then(({content}) => {
        if (content) {
          content = JSON.stringify(content)
          if (field) {
            content = isFcn
              ? `/**/;${field}(${content});`
              : `/**/;var ${field}=${content};`
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

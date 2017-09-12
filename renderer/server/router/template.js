'use strict'

const express = require('express')

const Resolver = require('../controllers/resolver')

function router () {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    Resolver(req.path)
      .then(({template}) => { template ? res.redirect(`/_assets/templates/${template}`) : res.sendStatus(404) })
      .catch(next)
  })

  return router
}

module.exports = router

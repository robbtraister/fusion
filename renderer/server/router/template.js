'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')

function router () {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    resolve(req.path)
      .then(({template}) => { template ? res.redirect(`/_assets/templates/${template}`) : res.sendStatus(404) })
      .catch(next)
  })

  return router
}

module.exports = router

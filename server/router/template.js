'use strict'

const express = require('express')

const Template = require('../controllers/template')

function router () {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    Template(req.path)
      .then(template => { template ? res.redirect(`/_assets/templates/${template}`) : res.sendStatus(404) })
      .catch(next)
  })

  return router
}

module.exports = router

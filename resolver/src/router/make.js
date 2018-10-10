'use strict'

const express = require('express')

const make = require('../controllers/make')
const { handler: redirectHandler } = require('../errors/redirect-error')

const makeRouter = express.Router()

makeRouter.get('*', (req, res, next) => {
  const arcSite = req.query._website || req.get('Arc-Site')
  make(req.url, arcSite, req.get('Fusion-Engine-Version'), req.query.outputType, req.get('Fusion-Cache-Mode'))
    .then(data => { res.send(data) })
    .catch(redirectHandler(req.baseUrl))
    .catch(next)
})

module.exports = makeRouter

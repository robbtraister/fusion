'use strict'

const express = require('express')

const make = require('../controllers/make')

const makeRouter = express.Router()

makeRouter.get('*', (req, res, next) => {
  const arcSite = req.query._website || req.get('Arc-Site')
  make(req.url, req.query.outputType, req.get('Fusion-Engine-Version'), arcSite)
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = makeRouter

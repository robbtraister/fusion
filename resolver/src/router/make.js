'use strict'

const express = require('express')

const make = require('../controllers/make')

const makeRouter = express.Router()

makeRouter.get('*', (req, res, next) => {
  make(req.url, req.query.outputType, req.get('Fusion-Engine-Version'), req.get('Arc-Site'))
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = makeRouter

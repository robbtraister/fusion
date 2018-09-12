'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')
const { handler: redirectHandler } = require('../errors/redirect-error')

const resolveRouter = express.Router()

const resolveHandler = (getUri) => (req, res, next) => {
  const uri = getUri(req)
  if (uri) {
    const arcSite = req.query._website || req.get('Arc-Site')
    resolve(uri, arcSite, req.get('Fusion-Engine-Version'))
      .then(data => { res.send(data) })
      .catch(redirectHandler(req.baseUrl))
      .catch(next)
  } else {
    next()
  }
}

resolveRouter.get('/', resolveHandler((req) => req.query.uri))
resolveRouter.get('*', resolveHandler((req) => req.url))

module.exports = resolveRouter

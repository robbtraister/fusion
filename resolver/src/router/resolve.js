'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')
const { handler: redirectHandler } = require('../errors/redirect-error')

const resolveRouter = express.Router()

const resolveHandler = (getUri) => (req, res, next) => {
  const requestUri = getUri(req)
  if (requestUri) {
    const arcSite = req.query._website || req.get('Arc-Site')
    resolve(
      requestUri,
      {
        arcSite,
        version: req.get('Fusion-Engine-Version'),
        cacheMode: req.get('Fusion-Cache-Mode')
      }
    )
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

'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')
const { handler: redirectHandler } = require('../errors/redirect-error')

const resolveRouter = express.Router()

const resolveHandler = (getUri) => async (req, res, next) => {
  try {
    const requestUri = getUri(req)
    if (requestUri) {
      const arcSite = req.query._website || req.get('Arc-Site')
      const data = await resolve(
        requestUri,
        {
          arcSite,
          version: req.get('Fusion-Engine-Version'),
          cacheMode: req.get('Fusion-Cache-Mode')
        }
      )
      res.send(data)
    } else {
      next()
    }
  } catch (e) {
    try {
      redirectHandler(req.baseUrl)(e)
    } catch (e) {
      next(e)
    }
  }
}

resolveRouter.get('/', resolveHandler((req) => req.query.uri))
resolveRouter.get('*', resolveHandler((req) => req.url))

module.exports = resolveRouter

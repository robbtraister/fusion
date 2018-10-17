'use strict'

const express = require('express')

const make = require('../controllers/make')
const isWhy404 = require('../utils/is-why-404')

const makeRouter = express.Router()

makeRouter.get('*',
  async (req, res, next) => {
    try {
      const arcSite = req.query._website || req.get('Arc-Site')

      const opts = {
        arcSite,
        version: req.get('Fusion-Engine-Version'),
        outputType: req.query.outputType,
        cacheMode: req.get('Fusion-Cache-Mode'),
        why404: isWhy404(req)
      }

      const data = await make(req.url, opts)
      res.send(data)
    } catch (e) {
      next(e)
    }
  }
)

module.exports = makeRouter

'use strict'

const express = require('express')

const make = require('../controllers/make')
const isWhy404 = require('../utils/is-why-404')

const makeRouter = express.Router()

const makeOptions = (req) => ({
  arcSite: req.query._website || req.get('Arc-Site'),
  version: req.get('Fusion-Engine-Version'),
  outputType: req.query.outputType,
  cacheMode: req.get('Fusion-Cache-Mode'),
  why404: isWhy404(req)
})

makeRouter.get('*', async (req, res, next) => {
  try {
    const response = await make(req.url, makeOptions(req))
    res.send(response)
  } catch (e) {
    next(e)
  }
})

module.exports = makeRouter
module.exports.makeOptions = makeOptions

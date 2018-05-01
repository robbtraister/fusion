'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')

const resolveRouter = express.Router()

resolveRouter.get('*', (req, res, next) => {
  const arcSite = req.get('Arc-Site') || req.query._website
  resolve(req.url, arcSite)
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = resolveRouter

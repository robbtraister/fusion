'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')
const redirectHandler = require('../errors/RedirectError').handler

const resolveRouter = express.Router()

resolveRouter.get('*', (req, res, next) => {
  const arcSite = req.query._website || req.get('Arc-Site')
  resolve(req.url, arcSite, req.get('Fusion-Engine-Version'))
    .then(data => { res.send(data) })
    .catch(redirectHandler(req.baseUrl))
    .catch(next)
})

module.exports = resolveRouter

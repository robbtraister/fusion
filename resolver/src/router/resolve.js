'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')

const resolveRouter = express.Router()

resolveRouter.get('*', (req, res, next) => {
  resolve(req.url, req.get('Arc-Site'))
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = resolveRouter

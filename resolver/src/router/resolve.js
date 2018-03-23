'use strict'

const express = require('express')

const resolve = require('../controllers/resolve')

const resolveRouter = express.Router()

resolveRouter.get('*', (req, res, next) => {
  resolve(req.url)
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = resolveRouter

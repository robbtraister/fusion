'use strict'

const express = require('express')

const make = require('../controllers/make')

const makeRouter = express.Router()

makeRouter.get('*', (req, res, next) => {
  make(req.url)
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = makeRouter

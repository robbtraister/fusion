'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const {
  pushResolvers
} = require('../io')

const {
  bodyLimit
} = require('../../environment')

const resolverRouter = express.Router()

resolverRouter.post('/',
  bodyParser.json({ limit: bodyLimit }),
  (req, res, next) =>
    pushResolvers(req.body)
      .then(() => { next() })
      .catch(next),
  (req, res) => { res.sendStatus(204) }
)

module.exports = resolverRouter

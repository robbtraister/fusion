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
  async (req, res, next) => {
    try {
      await pushResolvers(req.body)
      res.sendStatus(204)
    } catch (e) {
      next(e)
    }
  }
)

module.exports = resolverRouter

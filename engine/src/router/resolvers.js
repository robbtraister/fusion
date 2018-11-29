'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const {
  putResolvers
} = require('../io')

const {
  bodyLimit
} = require('../../environment')

const resolverRouter = express.Router()

resolverRouter.post('/',
  bodyParser.json({ limit: bodyLimit }),
  async (req, res, next) => {
    try {
      await putResolvers(req.body)
      res.sendStatus(204)
    } catch (e) {
      next(e)
    }
  }
)

module.exports = resolverRouter

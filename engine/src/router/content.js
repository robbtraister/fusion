'use strict'

const express = require('express')

const getSource = require('../content/sources')

const contentRouter = express.Router()

contentRouter.get(['/', '/:source', '/:source/:key'],
  (req, res, next) => {
    const sourceName = req.params.source || req.query.source
    const keyString = req.params.key || req.query.key
    const query = req.query.query

    const source = getSource(sourceName)

    new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(keyString))
      } catch (e) {
        reject(e)
      }
    })
      .catch(() => keyString)
      .then(key => source.fetch(key))
      .then(data => source.filter(query, data))
      .then(data => { res.send(data) })
      .catch(next)
  }
)

module.exports = contentRouter

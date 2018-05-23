'use strict'

const express = require('express')

const getSource = require('../models/sources')

const contentRouter = express.Router()

contentRouter.get(['/', '/:source', '/:source/:key'],
  (req, res, next) => {
    const sourceName = req.params.source || req.query.source
    const keyString = req.params.key || req.query.key
    const query = req.query.query
    const website = req.query._website

    Promise.all([
      getSource(sourceName),
      new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(keyString))
        } catch (e) {
          reject(e)
        }
      })
        .catch(() => ({key: keyString}))
        .then((key) => Object.assign(key, {'arc-site': website}))
    ])
      .then(([source, key]) => source.fetch(key)
        .then(data => source.filter(query, data)))
      .then(data => { res.send(data) })
      .catch(next)
  }
)

module.exports = contentRouter

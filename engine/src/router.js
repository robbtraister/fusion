'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const render = require('./react/render')

const getSource = require('./sources')

const router = express.Router()

router.get(['/', '/:source', '/:source/:key'],
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
      .then(data => query
        ? source.filter(query, JSON.parse(data))
        : data
      )
      .then(data => res.send(data))
      .catch(next)
  }
)

router.post('/',
  bodyParser.json(),
  (req, res, next) => {
    render(req.body)
      .then(data => res.send(data))
      .catch(next)
  }
)

module.exports = router

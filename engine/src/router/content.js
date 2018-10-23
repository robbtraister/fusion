'use strict'

const express = require('express')

const getSource = require('../models/sources')

const contentRouter = express.Router()

contentRouter.route(['/clear', '/clear/:source', '/clear/:source/:key'])
  .post((req, res, next) => {
    const sourceName = req.params.source || req.query.source
    const keyString = req.params.key || req.query.key
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
        .catch(() => ({ key: keyString }))
        .then((key) => Object.assign(key, { 'arc-site': website }))
    ])
      .then(([source, key]) => source.clear(key))
      .then(() => { res.sendStatus(204) })
      .catch(next)
  })
  .all((req, res, next) => { res.sendStatus(405) })

const fetchHandler = (forceUpdate) => (req, res, next) => {
  const sourceName = req.params.source || req.query.source
  const keyString = req.params.key || req.query.key
  const filter = req.query.filter || req.query.query
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
      .catch(() => ({ key: keyString }))
      .then((key) => Object.assign({ 'arc-site': website }, key))
  ])
    .then(([source, key]) => source.fetch(key, forceUpdate)
      .then(data => source.filter(filter, data)))
    .then(data => { res.send(data) })
    .catch(next)
}

const freshHandler = fetchHandler(true)
const staleHandler = fetchHandler(false)

contentRouter.route(['/fetch', '/fetch/:source', '/fetch/:source/:key'])
  .get((req, res, next) => {
    const cacheMode = req.get('Fusion-Cache-Mode')
    const handler = (cacheMode === 'update')
      ? freshHandler
      : staleHandler
    handler(req, res, next)
  })
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/update', '/update/:source', '/update/:source/:key'])
  .post(freshHandler)
  .all((req, res, next) => { res.sendStatus(405) })

module.exports = contentRouter

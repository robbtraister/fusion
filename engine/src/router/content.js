'use strict'

const express = require('express')

const getSource = require('../models/sources')

const contentRouter = express.Router()

const getKey = function getKey (keyString, website) {
  let key
  try {
    key = JSON.parse(keyString)
  } catch (e) {
    key = { key: keyString }
  }

  return Object.assign({ 'arc-site': website }, key)
}

const fetchHandler = (forceUpdate) =>
  async (req, res, next) => {
    try {
      const sourceName = req.params.source || req.query.source
      const keyString = req.params.key || req.query.key
      const filter = req.query.filter || req.query.query
      const website = req.query._website
      const followRedirect = req.query.followRedirect !== 'false'
      const maxRedirects = +req.query.maxRedirects

      const sourcePromise = getSource(sourceName)
      const key = getKey(keyString, website)
      const source = await sourcePromise

      const data = await source.fetch(key, { forceUpdate, followRedirect, maxRedirects })
      const filtered = await source.filter(filter, data)
      res.send(filtered)
    } catch (e) {
      next(e)
    }
  }

contentRouter.route(['/clear', '/clear/:source', '/clear/:source/:key'])
  .post(
    async (req, res, next) => {
      try {
        const sourceName = req.params.source || req.query.source
        const keyString = req.params.key || req.query.key
        const website = req.query._website

        const sourcePromise = getSource(sourceName)
        const key = getKey(keyString, website)

        const source = await sourcePromise
        await source.clear(key)

        res.sendStatus(204)
      } catch (e) {
        next(e)
      }
    }
  )
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/fetch', '/fetch/:source', '/fetch/:source/:key'])
  .get(fetchHandler())
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/update', '/update/:source', '/update/:source/:key'])
  .post(fetchHandler(true))
  .all((req, res, next) => { res.sendStatus(405) })

module.exports = contentRouter

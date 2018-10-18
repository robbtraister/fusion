'use strict'

const express = require('express')

const getSource = require('../models/sources')

const contentRouter = express.Router()

const getQuery = function getQuery (queryString, website) {
  let query
  try {
    query = JSON.parse(queryString)
  } catch (e) {
    query = { query: queryString }
  }

  return Object.assign({ 'arc-site': website }, query)
}

const fetchHandler = (forceUpdate) =>
  async (req, res, next) => {
    try {
      const sourceName = req.params.source || req.query.source
      const queryString = req.params.query || req.query.query
      const filter = req.query.filter || req.query.query
      const website = req.query._website
      const followRedirect = req.query.followRedirect !== 'false'
      const maxRedirects = +req.query.maxRedirects

      const sourcePromise = getSource(sourceName)
      const query = getQuery(queryString, website)
      const source = await sourcePromise

      const data = await source.fetch(query, { forceUpdate, followRedirect, maxRedirects })
      const filtered = await source.filter(filter, data)
      res.send(filtered)
    } catch (e) {
      next(e)
    }
  }

contentRouter.route(['/clear', '/clear/:source', '/clear/:source/:query'])
  .post(
    async (req, res, next) => {
      try {
        const sourceName = req.params.source || req.query.source
        const queryString = req.params.query || req.query.query
        const website = req.query._website

        const sourcePromise = getSource(sourceName)
        const query = getQuery(queryString, website)

        const source = await sourcePromise
        await source.clear(query)

        res.sendStatus(204)
      } catch (e) {
        next(e)
      }
    }
  )
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/fetch', '/fetch/:source', '/fetch/:source/:query'])
  .get(fetchHandler())
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/update', '/update/:source', '/update/:source/:query'])
  .post(fetchHandler(true))
  .all((req, res, next) => { res.sendStatus(405) })

module.exports = contentRouter

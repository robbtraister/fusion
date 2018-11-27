'use strict'

const express = require('express')

const { getContentSource } = require('../content')

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

contentRouter.route(['/clear', '/clear/:source', '/clear/:source/:query'])
  .post(
    async (req, res, next) => {
      try {
        const sourceName = req.params.source || req.query.source
        const queryString = req.params.query || req.query.query || req.query.key
        const website = req.arcSite

        const sourcePromise = getContentSource(sourceName)
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

const fetchHandler = (forceUpdate) =>
  async (req, res, next) => {
    try {
      const sourceName = req.params.source || req.query.source
      const queryString = req.params.query || req.query.query || req.query.key
      const filter = req.query.filter
      const website = req.arcSite
      const followRedirect = req.query.followRedirect !== 'false'
      const maxRedirects = +req.query.maxRedirects

      const sourcePromise = getContentSource(sourceName)
      const query = getQuery(queryString, website)
      const source = await sourcePromise

      const { data } = await source.fetch(query, { forceUpdate, followRedirect, maxRedirects })
      const filtered = await source.filter(filter, data)
      res.send(filtered)
    } catch (e) {
      next(e)
    }
  }

const freshHandler = fetchHandler(true)
const staleHandler = fetchHandler(false)

contentRouter.route(['/fetch', '/fetch/:source', '/fetch/:source/:query'])
  .get((req, res, next) => {
    const cacheMode = req.get('Fusion-Cache-Mode')
    const handler = (cacheMode === 'update')
      ? freshHandler
      : staleHandler
    handler(req, res, next)
  })
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/update', '/update/:source', '/update/:source/:query'])
  .post(freshHandler)
  .all((req, res, next) => { res.sendStatus(405) })

module.exports = contentRouter

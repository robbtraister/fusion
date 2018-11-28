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

        const source = await getContentSource(sourceName)
        const query = getQuery(queryString, website)

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

      const cacheMode = req.get('Fusion-Cache-Mode')
      const followRedirect = !/^false$/i.test(req.query.followRedirect)
      const maxRedirects = req.query.maxRedirects
      const ignoreCache = /^true$/i.test(req.query._ignoreCache)

      const source = await getContentSource(sourceName)
      const query = getQuery(queryString, website)

      const { data } = await source.fetch(
        query,
        {
          forceUpdate: forceUpdate || /^update$/i.test(cacheMode),
          followRedirect,
          ignoreCache,
          maxRedirects
        }
      )
      const filtered = await source.filter(filter, data)
      res.send(filtered)
    } catch (e) {
      next(e)
    }
  }

contentRouter.route(['/fetch', '/fetch/:source', '/fetch/:source/:query'])
  .get(fetchHandler(false))
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/update', '/update/:source', '/update/:source/:query'])
  .post(fetchHandler(true))
  .all((req, res, next) => { res.sendStatus(405) })

module.exports = contentRouter

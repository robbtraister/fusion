'use strict'

const bodyParser = require('body-parser')
const express = require('express')

const debugTimer = require('debug')('fusion:timer:router')

const render = require('./react/render')

const timer = require('./timer')

const getSource = require('./sources')
const { getPageRendering, getTemplateRendering } = require('./renderings')

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

router.post(['/', '/page/:page', '/template/:template'],
  bodyParser.json(),
  (req, res, next) => {
    const tic = timer.tic()
    const payload = (req.body.page || req.body.template)
      ? req.body
      : Object.assign(
        {
          page: req.params.page,
          template: req.params.template
        },
        req.body
      )

    ;(
      (payload.page)
        ? getPageRendering(payload.page)
        : getTemplateRendering(payload.template)
    )
      .then(rendering => render(Object.assign({}, payload, {rendering, requestUri: req.originalUrl})))
      .then(data => res.send(data))
      .then(() => {
        debugTimer('complete response', tic.toc())
      })
      .catch(next)
  }
)

module.exports = router

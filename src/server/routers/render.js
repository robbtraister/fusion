'use strict'

const debug = require('debug')(`fusion:render:${process.pid}`)
const express = require('express')
const cookieParser = require('cookie-parser')

const controller = require('../controllers/render')
const content = require('../controllers/content')
const templates = require('../controllers/templates')

function getRenderingOptions () {
  return function (req, res, next) {
    debug('query:', req.query)
    debug('cookies:', req.cookies)

    function hasQueryParam (q) {
      return req.query.hasOwnProperty(q) && ['false', '0'].indexOf(req.query[q]) < 0
    }

    let noscript = false
    let rendered = false

    if (hasQueryParam('norender')) {
      res.cookie('FUSION_NORENDER', 1)
      noscript = false
      rendered = false
    } else if (hasQueryParam('noscript')) {
      res.cookie('FUSION_NOSCRIPT', 1)
      noscript = true
      rendered = false
    } else if (hasQueryParam('rendered')) {
      res.cookie('FUSION_RENDERED', 1)
      noscript = false
      rendered = true
    } else if (req.cookies.hasOwnProperty) { // if no cookies, will be `null` object
      if (req.cookies.hasOwnProperty('FUSION_NORENDER')) {
        // do nothing
      } else if (req.cookies.hasOwnProperty('FUSION_NOSCRIPT')) {
        noscript = true
      } else if (req.cookies.hasOwnProperty('FUSION_RENDERED')) {
        rendered = true
      }
    }

    if (noscript) {
      res.clearCookie('FUSION_NORENDER')
      res.clearCookie('FUSION_RENDERED')
      req.renderingOptions = {}
    } else if (rendered) {
      res.clearCookie('FUSION_NORENDER')
      res.clearCookie('FUSION_NOSCRIPT')
      req.renderingOptions = { includeScripts: true }
    } else {
      res.clearCookie('FUSION_NOSCRIPT')
      res.clearCookie('FUSION_RENDERED')
      delete req.renderingOptions
    }

    next()
  }
}

function router () {
  let router = express.Router()

  router.use(cookieParser())
  router.use(getRenderingOptions())

  router.use((req, res, next) => {
    function errHandler (err) {
      next({
        status: 500,
        msg: err
      })
    }

    let contentURI = content.resolve(req.path)
    let templateName = templates.resolve(req.path)

    if (req.renderingOptions) {
      controller.render(templateName, contentURI, req.renderingOptions)
        .then(res.send.bind(res))
        .catch(errHandler)
    } else {
      try {
        res.send(
          controller.renderEmpty(templateName, contentURI, {
            includeScripts: true,
            includeNoscript: true
          })
        )
      } catch (err) {
        errHandler(err)
      }
    }
  })

  return router
}

module.exports = router
module.exports.router = router

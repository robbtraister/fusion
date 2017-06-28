'use strict'

const debug = require('debug')(`fusion:render:${process.pid}`)
const express = require('express')
const cookieParser = require('cookie-parser')

// Components bundle does not include react lib; must expose it as the explicit lib name
global.react = require('react')
const ReactDOMServer = require('react-dom/server')

// Components bundle will load `Components` variable into global scope for client use
require('../../dist/templates')
const Templates = global.Templates // require('../../components/components')
Templates.Index = require('./template')

const fetch = require('./content').fetch
const getTemplate = require('./templates').get

function renderHTML (body, options) {
  try {
    return '<!DOCTYPE html>' +
      ReactDOMServer.renderToStaticMarkup(Templates.Index(body, options))
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function renderBody (template, state, options) {
  debug('state:', state)
  try {
    return renderHTML(ReactDOMServer.renderToStaticMarkup(Templates[template](state)), options)
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function renderURI (uri, options) {
  return fetch(uri)
    .then(JSON.parse.bind(JSON))
    .then(state => renderBody(getTemplate(uri), state, options))
}

function getRenderingOptions () {
  return function (req, res, next) {
    debug('query', req.query)
    debug('cookies', req.cookies)

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
    if (req.renderingOptions) {
      renderURI(req.path, req.renderingOptions)
        .then(res.send.bind(res))
        .catch(err => {
          next({
            status: 500,
            msg: err
          })
        })
    } else {
      next()
    }
  })

  return router
}

module.exports = router
module.exports.renderBody = renderBody
module.exports.renderHTML = renderHTML
module.exports.renderURI = renderURI

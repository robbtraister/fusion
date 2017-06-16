'use strict'

const debug = require('debug')(`fusion:render:${process.pid}`)
const express = require('express')
const cookieParser = require('cookie-parser')

// Components bundle does not include react lib; must expose it as the explicit lib name
const React = global.react = require('react')
const ReactDOMServer = require('react-dom/server')

// Components bundle will load `Components` variable into global scope
require('../../dist/components')
const Components = global.Components // require('../components')
const Engine = require('../engine')
const engine = React.createFactory(Engine(Components))

const Content = require('./content')
const Layouts = require('./layouts')
const Template = require('./template')

function renderHTML (body, options) {
  try {
    return '<!DOCTYPE html>' +
      ReactDOMServer.renderToStaticMarkup(Template(body, options))
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function renderBody (props, options) {
  try {
    return renderHTML(ReactDOMServer.renderToStaticMarkup(engine(props)), options)
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function fetchContent (src) {
  return Content.fetch(src).then(JSON.parse.bind(JSON))
}

function fetchLayout (src) {
  return Layouts.fetch(src).then(JSON.parse.bind(JSON))
}

const fetcher = Engine.Fetcher(fetchContent, fetchLayout)
function renderURI (uri, options) {
  return fetcher(uri)
    .then(props => renderBody(props, options))
}

function getRenderingOptions () {
  return function (req, res, next) {
    function hasQueryParam (q) {
      return req.query.hasOwnProperty(q) && req.query[q] !== 'false'
    }

    let noscript = false
    let rendered = false

    if (hasQueryParam('norender')) {
      res.cookie('FUSION_NORENDER', true)
      noscript = false
      rendered = false
    } else if (hasQueryParam('noscript')) {
      res.cookie('FUSION_NOSCRIPT', true)
      noscript = true
      rendered = false
    } else if (hasQueryParam('rendered')) {
      res.cookie('FUSION_RENDERED', true)
      noscript = false
      rendered = true
    } else if (req.cookies.hasOwnProperty('FUSION_NORENDER')) {
      // do nothing
    } else if (req.cookies.hasOwnProperty('FUSION_NOSCRIPT')) {
      noscript = true
    } else if (req.cookies.hasOwnProperty('FUSION_RENDERED')) {
      rendered = true
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

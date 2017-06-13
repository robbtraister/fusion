'use strict'

const debug = require('debug')(`pb:render:${process.pid}`)
const express = require('express')

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

function renderHTML (body) {
  try {
    return '<!DOCTYPE html>' +
      ReactDOMServer.renderToStaticMarkup(Template(body))
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function renderBody (props) {
  try {
    return renderHTML(ReactDOMServer.renderToStaticMarkup(engine(props)))
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
function renderURI (uri, includeScripts, includeNoscript) {
  return fetcher(uri)
    .then(props => renderBody(props, includeScripts, includeNoscript))
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    renderURI(req.path)
      .then(res.send.bind(res))
      .catch(err => {
        next({
          status: 500,
          msg: err
        })
      })
  })

  return router
}

module.exports = router
module.exports.renderBody = renderBody
module.exports.renderHTML = renderHTML
module.exports.renderURI = renderURI
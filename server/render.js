'use strict'

const debug = require('debug')(`pb:render:${process.pid}`)
const express = require('express')

// Components bundle does not include react lib; expose it as the explicit lib name
const React = global.react = require('react')
const ReactDOMServer = require('react-dom/server')

// Components bundle will load `Components` variable into global scope
require('../dist/components')
const Components = global.Components // require('../components')
const engine = React.createFactory(require('../engine')(Components))

const contentFetch = require('./content').fetch
const layoutFetch = require('./layouts').fetch
const template = require('./template')

function renderHTML (body, omitScripts) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(template(body, omitScripts))
}

function renderBody (content, layout, omitScripts) {
  return renderHTML(ReactDOMServer.renderToStaticMarkup(engine({content, layout})), omitScripts)
}

function renderURI (uri, omitScripts) {
  return Promise.all([
    layoutFetch(uri),
    contentFetch(uri)
  ])
    .then(data => {
      let layout = data.shift()
      let content = data.shift()
      debug('layout:', JSON.parse(layout))
      debug('content:', JSON.parse(content))

      return renderBody(JSON.parse(content), JSON.parse(layout), omitScripts)
    })
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    let param = [
      'noscript',
      'rendered'
    ].find(q => req.query.hasOwnProperty(q) && req.query[q] !== 'false')
    if (param) {
      renderURI(req.path, param === 'noscript')
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

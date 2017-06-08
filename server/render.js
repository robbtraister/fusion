'use strict'

const debug = require('debug')(`pb:render:${process.pid}`)
const express = require('express')

// Components bundle does not include react lib; expose it as the explicit lib name
const React = global.react = require('react')
const ReactDOMServer = require('react-dom/server')

// Components bundle will load `Components` variable into global scope
require('../dist/components')
const Components = global.Components // require('../components')
const Engine = React.createFactory(require('../engine')(Components))

const fetch = require('./content').fetch
const template = require('./template')

function renderContent (content, omitScripts) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(template(content, omitScripts))
}

function renderLayout (layout, omitScripts) {
  return renderContent(ReactDOMServer.renderToStaticMarkup(Engine(layout)), omitScripts)
}

function renderURI (uri, omitScripts, cb) {
  fetch(uri, (err, buf) => {
    if (err) {
      return cb(err)
    }
    let layout = JSON.parse(buf)
    debug('layout:', layout)
    cb(null, renderLayout(layout, omitScripts))
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
      renderURI(req.path, param === 'noscript', (err, result) => {
        if (err) {
          return next({
            status: 500,
            msg: err
          })
        }
        res.send(result)
      })
    } else {
      next()
    }
  })

  return router
}

module.exports = router
module.exports.renderContent = renderContent
module.exports.renderLayout = renderLayout
module.exports.renderURI = renderURI

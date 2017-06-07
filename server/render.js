'use strict'

const debug = require('debug')('pb:render')
const express = require('express')

const React = require('react')
const ReactDOMServer = require('react-dom/server')
const Engine = React.createFactory(require('../engine')(require('../components')))

const fetch = require('./content').fetch
const template = require('./template')

function renderLayout (layout) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(
      template(ReactDOMServer.renderToStaticMarkup(Engine({layout})))
    )
}

function renderURI (uri, cb) {
  fetch(uri, (err, buf) => {
    if (err) {
      return cb(err)
    }
    let layout = JSON.parse(buf)
    debug('layout:', layout)
    cb(null, renderLayout(layout))
  })
}

function router () {
  let router = express.Router()

  router.use((req, res, next) => {
    if (req.query.hasOwnProperty('rendered') && req.query.rendered !== 'false') {
      renderURI(req.path, (err, result) => {
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
module.exports.renderLayout = renderLayout
module.exports.renderURI = renderURI

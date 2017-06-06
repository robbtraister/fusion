#!/usr/bin/env node

'use strict'

require('babel-core/register')

const fs = require('fs')
const path = require('path')
const url = require('url')

const express = require('express')
const morgan = require('morgan')
const compression = require('compression')

const React = require('react')
const ReactDOMServer = require('react-dom/server')

const App = React.createFactory(require('../render/app'))

const template = require('./template')

function server () {
  let root = path.join(__dirname, '..')

  let app = express()

  app.use(morgan('common'))

  app.use(compression())

  app.use((req, res, next) => {
    if (req.query.hasOwnProperty('rendered') && req.query.rendered !== 'false') {
      let f = url.parse(req.originalUrl).pathname.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.(html?|jsonp?)$/, '')
      fs.readFile(path.join(root, 'content', `${f || 'homepage'}.json`), (err, buf) => {
        if (err) {
          return res.sendStatus(500)
        }
        res.send('<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
          template(ReactDOMServer.renderToStaticMarkup(App({layout: JSON.parse(buf)})))
        ))
      })
    } else {
      next()
    }
  })

  app.use(/^\/content\/.+\.jsonp$/, (req, res, next) => {
    let f = url.parse(req.originalUrl).pathname.replace(/^\//, '').replace(/\.jsonp$/, '.json')
    fs.readFile(path.join(root, f), (err, buf) => {
      if (err) {
        return res.sendStatus(500)
      }
      if (req.query.m) {
        res.send(`${req.query.m.replace(/[^a-z_]*/gi, '')}(${buf.toString()})`)
      } else {
        res.send(`var ${(req.query.v || 'v').replace(/[^a-z_]*/gi, '')} = ${buf.toString()}`)
      }
    })
  })

  app.use('/content', express.static(path.join(root, 'content')))
  app.use(express.static(path.join(root, 'public')))

  var indexFilePath = path.join(__dirname, '..', 'public', 'index.html')
  app.get('*', (req, res, next) => {
    res.sendFile(indexFilePath)
  })

  const port = process.env.PORT || 8080
  return app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
  })
}

module.exports = server

if (module === require.main) {
  server()
}

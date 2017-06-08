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
  try {
    return '<!DOCTYPE html>' +
      ReactDOMServer.renderToStaticMarkup(template(body, omitScripts))
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function renderBody (contents, layout, omitScripts) {
  try {
    return renderHTML(ReactDOMServer.renderToStaticMarkup(engine({contents, layout})), omitScripts)
  } catch (e) {
    debug('error:', e)
    throw e
  }
}

function renderURI (uri, omitScripts) {
  let contents = {}
  contents[uri] = true
  return Promise.all([
    layoutFetch(uri)
      .then(layout => {
        function collect (elements) {
          elements.forEach(function (element) {
            if (element.children) {
              collect(element.children)
            } else if (element.content) {
              if (!contents.hasOwnProperty(element.content)) {
                contents[element.content] = false
              }
            }
          })
        }

        collect(layout)

        return Promise.all(
          Object.keys(contents).filter(function (contentSource) {
            return contents[contentSource] === false
          }).map(function (contentSource) {
            return contentFetch(contentSource)
              .then(function (data) {
                contents[contentSource] = JSON.parse(data)
              })
          })
        )
          .then(function () { return layout })
      }),
    contentFetch(uri)
      .then(data => {
        contents._default = contents[uri] = JSON.parse(data)
      })
  ])
    .then(data => {
      let layout = JSON.parse(data.shift())
      debug('layout:', layout)
      debug('content:', contents)

      return renderBody(contents, layout, omitScripts)
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

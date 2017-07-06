'use strict'

require('babel-core/register')

// const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')

const template = require('../template')

const content = require('./content')
const templates = require('./templates')

function renderEmpty (templateName, contentURI, options) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(template(templateName, contentURI, null, null, null, options))
}

function render (templateName, contentURI, options) {
  return content.fetch(contentURI)
    .then(JSON.parse.bind(JSON))
    .then(props => {
      let data = {}

      function renderToMarkup () {
        return ReactDOMServer.renderToStaticMarkup(
          template(templateName, contentURI, templates.load(templateName), props, data, options)
        )
      }

      let m = renderToMarkup()
      let keys = Object.keys(data)
      if (keys.length) {
        return Promise.all(keys.map(k => data[k]))
          .then(renderToMarkup)
      } else {
        return m
      }
    })
    .then(html => '<!DOCTYPE html>' + html)
    .catch(console.error)
}

module.exports = render
module.exports.render = render
module.exports.renderEmpty = renderEmpty

'use strict'

require('babel-core/register')

const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')
const request = require('request-promise-native')

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
      let cache = {}
      function cachedFetch (uri) {
        debug('sync fetching', uri)

        if (cache.hasOwnProperty(uri)) {
          if (!(cache[uri] instanceof Promise)) {
            return cache[uri]
          }
        } else {
          cache[uri] = request({
            uri: `http://localhost:8080${uri}`,
            json: true
          })
            .then(json => { cache[uri] = json })
        }
      }

      function renderToMarkup () {
        return ReactDOMServer.renderToStaticMarkup(
          template(templateName, contentURI, templates.load(templateName), props, cachedFetch, options)
        )
      }

      let markup = renderToMarkup()
      let keys = Object.keys(cache)
      if (keys.length) {
        return Promise.all(keys.map(k => cache[k]))
          .then(renderToMarkup)
      } else {
        return markup
      }
    })
    .then(html => '<!DOCTYPE html>' + html)
    .catch(console.error)
}

module.exports = render
module.exports.render = render
module.exports.renderEmpty = renderEmpty

'use strict'

require('babel-core/register')

const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')
const request = require('request-promise-native')

const wrapper = require('./wrapper')

const content = require('./content')
const templates = require('./templates')

function renderToMarkup (templateName, contentURI, options, component, props, fetch) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(
      wrapper(
        templateName,
        contentURI,
        options,
        component,
        props,
        fetch
      )
    )
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

      let template = templates.load(templateName)
      function renderHydrated () {
        return renderToMarkup(templateName, contentURI, options, template, props, cachedFetch)
      }

      let htmlPromise = Promise.resolve(renderHydrated())
      let keys = Object.keys(cache)
      if (keys.length) {
        htmlPromise = Promise.all(keys.map(k => cache[k]))
          .then(renderHydrated)
      }

      return htmlPromise
    })
    .then(html => '<!DOCTYPE html>' + html)
    .catch(console.error)
}

module.exports = render
module.exports.render = render
module.exports.renderToMarkup = renderToMarkup

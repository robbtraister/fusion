'use strict'

require('babel-core/register')

const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')
const request = require('request-promise-native')

const wrapper = require('./wrapper')

const content = require('./content')
const templates = require('./templates')

function renderToMarkup (templateName, contentURI, options, component, props, fetch, cache) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(
      wrapper(
        templateName,
        contentURI,
        options,
        component,
        props,
        fetch,
        cache
      )
    )
}

function _render (templateName, contentURI, options, contentOnly) {
  return content.fetch(contentURI)
    .then(JSON.parse.bind(JSON))
    .then(props => {
      let cache = {}
      function cachedFetch (uri, component, asyncOnly) {
        if (!asyncOnly) {
          debug('sync fetching', uri)

          if (uri === contentURI) {
            cache[uri] = props
            return props
          }

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
        return null
      }

      let template = templates.load(templateName)
      function renderHydrated (hydrated) {
        return renderToMarkup(templateName, contentURI, options, template, props, cachedFetch, hydrated ? cache : null)
      }

      let htmlPromise = Promise.resolve(renderHydrated(false))
      let keys = Object.keys(cache)

      if (contentOnly) {
        return Promise.all(keys.map(k => cache[k]))
          .then(() => {
            cache[contentURI] = props
            return cache
          })
      } else if (keys.length) {
        htmlPromise = Promise.all(keys.map(k => cache[k]))
          .then(() => renderHydrated(true))
      }

      return htmlPromise
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}

function dependencies (templateName, contentURI, options) {
  return _render(templateName, contentURI, options, true)
}

function render (templateName, contentURI, options) {
  return _render(templateName, contentURI, options)
    .then(html => '<!DOCTYPE html>' + html)
}

module.exports = render
module.exports.dependencies = dependencies
module.exports.render = render
module.exports.renderToMarkup = renderToMarkup

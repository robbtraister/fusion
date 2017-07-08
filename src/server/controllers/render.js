'use strict'

require('babel-core/register')

const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')
const request = require('request-promise-native')

const wrapper = require('./wrapper')

const Content = require('./content')
const Templates = require('./templates')

function render (templateName, contentURI, options, component, props, fetch, cache) {
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

function contentCache (contentURI) {
  let content = Content.fetch(contentURI)
    .then(JSON.parse.bind(JSON))

  let cache = {}
  function fetch (uri, component, asyncOnly) {
    if (!asyncOnly) {
      debug('sync fetching', uri)

      if (cache.hasOwnProperty(uri)) {
        if (!(cache[uri] instanceof Promise)) {
          return cache[uri]
        }
      } else {
        // don't add global content to the cache unless a component requests it
        cache[uri] = (
          (uri === contentURI)
          ? content
          : request({
            uri: `http://localhost:8080${uri}`,
            json: true
          })
        ).then(json => { cache[uri] = json })
      }
    }
    return null
  }

  return {
    cache,
    content,
    fetch
  }
}

function hydrate (templateName, contentURI, options) {
  let { cache, content, fetch } = contentCache(contentURI)
  let template = Templates.load(templateName)

  return content.then(content => {
    function renderHydrated (cache) {
      return render(templateName, contentURI, options, template, content, fetch, cache)
    }

    // render with no cache; fetch will populate it as necessary
    let dehydratedHTML = renderHydrated()
    let cacheKeys = Object.keys(cache)

    let cachePromise = Promise.all(cacheKeys.map(k => cache[k]))

    return {
      // if getting content, we want it populated with the global content
      // if rendering, we don't want to add global content to the html
      // so don't add to the cache until we know which we are doing
      // if a component requested global content uri, it will already be added
      content: () => cachePromise.then(() => { cache[contentURI] = content }).then(() => cache),
      // if no component content, don't re-render
      render: () => cacheKeys.length ? cachePromise.then(() => renderHydrated(cache)) : dehydratedHTML
    }
  })
}

function content (templateName, contentURI, options) {
  return hydrate(templateName, contentURI, options)
    .then(data => data.content())
}

function renderHydrated (templateName, contentURI, options) {
  return hydrate(templateName, contentURI, options)
    .then(data => data.render())
}

module.exports = renderHydrated
module.exports.content = content
module.exports.render = render
module.exports.renderHydrated = renderHydrated

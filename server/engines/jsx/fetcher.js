'use strict'

const request = require('request-promise-native')

function fetcher (precache) {
  precache = precache || {}
  const cache = {}

  function fetch (uri, component, asyncOnly) {
    if (!asyncOnly) {
      if (cache.hasOwnProperty(uri)) {
        if (!(cache[uri] instanceof Promise)) {
          return cache[uri]
        }
      } else {
        // don't add global content to the cache unless a component requests it
        cache[uri] = (
          (uri in precache)
          ? precache[uri]
          : request({
            uri: `http://0.0.0.0:8080${uri}`,
            json: true
          })
        ).then(json => { cache[uri] = json })
      }
    }
    return null
  }

  return {
    cache,
    fetch
  }
}

module.exports = fetcher

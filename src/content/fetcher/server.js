'use strict'

const debug = require('debug')(`fusion:content:fetcher:${process.pid}`)
const request = require('request-promise-native')

function fetcher () {
  const cache = {}

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
          (uri === this.contentURI)
          ? this.content
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

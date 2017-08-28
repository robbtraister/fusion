'use strict'

/* global contentCache */

function fetcher () {
  const cache = {}

  function fetch (uri, component) {
    if (!cache.hasOwnProperty(uri)) {
      cache[uri] = window.fetch(uri)
        .then(res => res.json())
    }

    cache[uri] = cache[uri].then(json => component.setState(json))
    return ((typeof contentCache !== 'undefined') && contentCache[uri]) || null
  }

  return {
    cache,
    fetch
  }
}

module.exports = fetcher

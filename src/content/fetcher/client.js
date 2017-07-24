'use strict'

/* global contentCache, fetch */

const cache = {}
function cachedFetch (uri, component) {
  if (!cache.hasOwnProperty(uri)) {
    cache[uri] = fetch(uri)
      .then(res => res.json())
  }

  cache[uri] = cache[uri].then(json => component.setState(json))
  return ((typeof contentCache !== 'undefined') && contentCache[uri]) || null
}

module.exports = cachedFetch

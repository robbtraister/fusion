'use strict'

const engine = require('./engine')

const fetch = function fetch (contentSource, contentKey) {
  return engine({
    // TODO: this stringify should also URI encode parameters
    // encodeURIComponent(...)
    uri: `/content/${contentSource}?key=${encodeURIComponent(JSON.stringify(contentKey))}`
  })
}


module.exports = fetch

'use strict'

const engine = require('./engine')

const fetch = function fetch (contentSource, contentKey) {
  return engine({
    uri: `/content/${contentSource}?key=${encodeURIComponent(JSON.stringify(contentKey))}`
  })
}

module.exports = fetch

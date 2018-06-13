'use strict'

const engine = require('./engine')

const fetch = function fetch (contentSource, contentKey, version) {
  return engine({
    uri: `/content/${contentSource}?key=${encodeURIComponent(JSON.stringify(contentKey))}`,
    version
  })
}

module.exports = fetch

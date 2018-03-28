'use strict'

const engine = require('./engine')

const fetch = function fetch (contentSource, contentKey) {
  console.log(`Fetching from ${contentSource} for contentKey: ${contentKey}`)
  return engine({
    uri: `/content/${contentSource}?key=${JSON.stringify(contentKey)}`
  })
}

module.exports = fetch

'use strict'

const engine = require('./engine')

const fetch = function fetch (contentSource, contentKey, arcSite, version) {
  return engine({
    uri: `/content/fetch/${contentSource}?key=${encodeURIComponent(JSON.stringify(contentKey))}${arcSite ? `&_website=${arcSite}` : ''}`,
    version
  })
}

module.exports = fetch

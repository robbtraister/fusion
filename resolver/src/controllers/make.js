'use strict'

const url = require('url')

const resolve = require('./resolve')
const engine = require('../utils/engine')

const endpoint = function endpoint (data, arcSite, outputType) {
  return url.format({
    pathname: '/render',
    query: {
      outputType,
      _website: arcSite
    }
  })
}

const make = function make (uri, arcSite, version, outputType, cacheMode) {
  return resolve(uri, arcSite)
    .then((data) =>
      data
        ? engine({
          method: 'POST',
          uri: endpoint(data, arcSite, outputType),
          data,
          version,
          cacheMode
        })
        : (() => {
          const e = new Error(`Could not resolve ${uri}`)
          e.statusCode = 404
          throw e
        })()
    )
}

module.exports = make

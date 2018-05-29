'use strict'

const resolve = require('./resolve')
const engine = require('./engine')
const url = require('url')

const endpoint = function endpoint (data, outputType, arcSite) {
  return url.format({
    pathname: `/render`,
    query: {
      outputType,
      _website: arcSite
    }
  })
}

const make = function make (uri, outputType, version, arcSite) {
  return resolve(uri, arcSite)
    .then((data) =>
      data
        ? engine({
          method: 'POST',
          uri: endpoint(data, outputType, arcSite),
          data,
          version
        })
        : (() => {
          const e = new Error(`Could not resolve ${uri}`)
          e.statusCode = 404
          throw e
        })()
    )
}

module.exports = make

'use strict'

const url = require('url')

const resolve = require('./resolve')
const engine = require('../utils/engine')
const { NotFoundError } = require('../errors')

const endpoint = function endpoint (data, arcSite, outputType, why404) {
  return url.format({
    pathname: '/render',
    query: {
      outputType,
      _website: arcSite,
      ...(why404 && { why404 })
    }
  })
}

const make = function make (uri, { arcSite, version, outputType, cacheMode, why404 }) {
  return resolve(uri, arcSite)
    .then((data) => {
      if (data) {
        return engine({
          method: 'POST',
          uri: endpoint(data, arcSite, outputType, why404),
          data,
          version,
          cacheMode
        }).catch((err) => {
          if (err.statusCode === 404) {
            throw new NotFoundError(`Could not resolve ${uri}`, {
              requestUri: uri,
              cause: err.message
            })
          }

          throw err
        })
      }

      throw new NotFoundError(`Could not resolve ${uri}`, {
        requestUri: uri,
        cause: 'Resolver could not be matched'
      })
    })
}

module.exports = make

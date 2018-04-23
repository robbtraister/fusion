'use strict'

const resolve = require('./resolve')
const engine = require('./engine')

const endpoint = function endpoint (data) {
  return `/render/${data.type}`
}

const make = function make (uri, outputType, version) {
  return resolve(uri)
    .then((data) => engine({
      method: 'POST',
      uri: endpoint(data, outputType),
      data,
      version
    }))
}

module.exports = make

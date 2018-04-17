'use strict'

const resolve = require('./resolve')
const engine = require('./engine')

const endpoint = function endpoint (data, outputType) {
  const query = outputType ? `?outputType=${outputType}` : ''
  return (data.page)
    ? `/render/page/${data.page}${query}`
    : `/render/template/${data.template}${query}`
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

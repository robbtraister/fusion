'use strict'

const resolve = require('./resolve')
const engine = require('./engine')

const endpoint = function endpoint (data) {
  return (data.page)
    ? `/render/page/${data.page}`
    : `/render/template/${data.template}`
}

const make = function make (uri, version) {
  return resolve(uri)
    .then((data) => engine({
      method: 'POST',
      uri: endpoint(data),
      data,
      version
    }))
}

module.exports = make

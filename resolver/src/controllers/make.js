'use strict'

const request = require('request-promise-native')

const resolve = require('./resolve')

const make = function make (uri) {
  return resolve(uri)
    .then((data) => request.post({
      uri: `http://engine-server:8082/render/template/${data.template}`,
      json: data
    }))
}

module.exports = make

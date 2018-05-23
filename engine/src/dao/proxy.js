'use strict'

// const BSON = require('bson')
const request = require('request-promise-native')

const debugTimer = require('debug')('fusion:timer:dao:proxy')

const { daoUrl } = require('../../environment')
const timer = require('../timer')

const models = {}

const fetch = function fetch (uri) {
  return request({
    uri: `${daoUrl}${uri}`,
    json: true
  })
}

const getModel = function getModel (modelName) {
  models[modelName] = models[modelName] || {
    name: modelName,

    find (query) {
      let tic = timer.tic()
      return fetch(`/${modelName}${query ? `?query=${encodeURIComponent(JSON.stringify(query))}` : ''}`)
        .then((data) => {
          debugTimer(`${modelName}.find()`, tic.toc())
          return data
        })
    },

    findOne (query) {
      let tic = timer.tic()
      return fetch(`/${modelName}${query ? `?query=${encodeURIComponent(JSON.stringify(query))}` : ''}&limit=1`)
        .then((data) => {
          debugTimer(`${modelName}.findOne()`, tic.toc())
          return data
        })
    },

    get (_id) {
      let tic = timer.tic()
      return fetch(`/${modelName}/${_id}`)
        .then((data) => {
          debugTimer(`${modelName}.get(${_id})`, tic.toc())
          return data
        })
    }
  }

  return models[modelName]
}

module.exports = getModel

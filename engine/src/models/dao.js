'use strict'

// const BSON = require('bson')
const request = require('request-promise-native')

const debugTimer = require('debug')('fusion:timer:renderings:dao')

const { daoUrl } = require('../environment')
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
      return fetch(`/${modelName}?query=${encodeURIComponent(JSON.stringify(query))}`)
        .then((data) => {
          debugTimer(`${modelName}.find()`, tic.toc())
          return data
        })
    },

    findById (_id) {
      let tic = timer.tic()
      return fetch(`/${modelName}/${_id}`)
        .then((data) => {
          debugTimer(`${modelName}.findById(${_id})`, tic.toc())
          return data // && data.shift()
        })
    },

    findOne (query) {
      let tic = timer.tic()
      return fetch(`/${modelName}?query=${encodeURIComponent(JSON.stringify(query))}&limit=1`)
        .then((data) => {
          debugTimer(`${modelName}.findOne()`, tic.toc())
          return data // && data.shift()
        })
    }
  }

  return models[modelName]
}

module.exports = getModel

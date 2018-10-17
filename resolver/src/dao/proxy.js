'use strict'

const request = require('request-promise-native')

const debugTimer = require('debug')('fusion:timer:renderings:dao')

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

    async find (query) {
      const tic = timer.tic()
      const data = await fetch(`/${modelName}${query ? `?query=${encodeURIComponent(JSON.stringify(query))}` : ''}`)
      debugTimer(`${modelName}.find()`, tic.toc())
      return data
    },

    async findById (_id) {
      const tic = timer.tic()
      const data = await fetch(`/${modelName}/${_id}`)
      debugTimer(`${modelName}.findById(${_id})`, tic.toc())
      return data // && data.shift()
    },

    async findOne (query) {
      const tic = timer.tic()
      const data = await fetch(`/${modelName}${query ? `?query=${encodeURIComponent(JSON.stringify(query))}` : ''}&limit=1`)
      debugTimer(`${modelName}.findOne()`, tic.toc())
      return data // && data.shift()
    }
  }

  return models[modelName]
}

module.exports = getModel

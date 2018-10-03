'use strict'

const mongoose = require('mongoose')

const debugTimer = require('debug')('fusion:timer:dao:mongoose')

const { mongoUrl } = require('../../environment')
const timer = require('../timer')

const { sendMetrics, METRIC_TYPES } = require('../utils/send-metrics')

const schema = new mongoose.Schema({ _id: String })

function getNewConnection (mongoUrl) {
  return Promise.resolve(mongoose.createConnection(mongoUrl))
}

function Mongoose (mongoUrl) {
  let connection
  function getConnection () {
    if (connection instanceof Promise) {
      return connection
    } else if (connection && [1, 2].includes(connection.readyState)) {
      return Promise.resolve(connection)
    }

    connection = getNewConnection(mongoUrl)
      .then((conn) => {
        connection = conn
        return conn
      })

    return connection
  }

  const collections = {}
  function getCollection (collectionName) {
    if (collectionName in collections) {
      if (collections[collectionName] instanceof Promise) {
        return collections[collectionName]
      } else if (collections[collectionName].s.topology.isConnected()) {
        return Promise.resolve(collections[collectionName])
      }
    }

    collections[collectionName] = getConnection()
      .then((conn) => {
        collections[collectionName] = conn.model(collectionName, schema, collectionName)
        return collections[collectionName]
      })

    return collections[collectionName]
  }

  const models = {}
  return {
    getModel (modelName) {
      models[modelName] = models[modelName] || {
        name: modelName,

        find (query) {
          let tic
          return getCollection(modelName)
            .then((model) => {
              tic = timer.tic()
              return model.find(query)
            })
            .then((data) => {
              const elapsedTime = tic.toc()
              debugTimer(`${modelName}.find()`, elapsedTime)
              sendMetrics([
                { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tag: ['operation:find'] },
                { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['operation:find', 'result:success'] }
              ])

              return data
            })
        },

        findOne (query) {
          let tic
          return getCollection(modelName)
            .then((model) => {
              tic = timer.tic()
              return model.findOne(query)
            })
            .then((data) => {
              const elapsedTime = tic.toc()
              debugTimer(`${modelName}.findOne()`, elapsedTime)
              sendMetrics([
                { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tags: ['operation:findOne'] },
                { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['result:success', 'operation:findOne'] }
              ])

              return data
            })
        },

        get (_id) {
          let tic
          return getCollection(modelName)
            .then((model) => {
              tic = timer.tic()
              return model.findById(_id)
            })
            .then((data) => {
              const elapsedTime = tic.toc()
              debugTimer(`${modelName}.get(${_id})`, elapsedTime)
              sendMetrics([
                { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tags: ['operation:get'] },
                { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['operation:get', 'result:success'] }
              ])

              return data
            })
        },

        put (doc) {
          let tic
          return getCollection(modelName)
            .then((model) => {
              tic = timer.tic()
              return model.update({ _id: doc._id }, doc, { upsert: true })
            })
            .then((data) => {
              const elapsedTime = tic.toc()
              debugTimer(`${modelName}.put()`, elapsedTime)
              sendMetrics([
                { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tags: ['operation:put'] },
                { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['operation:put', 'result:success'] }
              ])

              return data
            })
        }
      }

      return models[modelName]
    }
  }
}

module.exports = Mongoose(mongoUrl).getModel

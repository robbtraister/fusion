'use strict'

const url = require('url')

const debugTimer = require('debug')('fusion:timer:dao:mongo')

const { mongoUrl } = require('../../environment')

const timer = require('../timer')

const MongoClient = require('mongodb').MongoClient

const { sendMetrics, METRIC_TYPES } = require('../utils/send-metrics')

function getNewConnection (mongoUrl) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongoUrl, (err, connection) => err ? reject(err) : resolve(connection))
  })
}

function Mongo (mongoUrl) {
  const dbName = url.parse(mongoUrl).pathname.replace(/^\/+/, '')

  let db
  function getDatabase () {
    if (db instanceof Promise) {
      return db
    } else if (db && db.topology.isConnected()) {
      return Promise.resolve(db)
    }

    db = getNewConnection(mongoUrl)
      .then((conn) => {
        db = conn.db(dbName)
        return db
      })

    return db
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

    collections[collectionName] = getDatabase()
      .then((db) => {
        collections[collectionName] = db.collection(collectionName)
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
            .then((collection) => {
              tic = timer.tic()
              return collection.find(query)
            })
            .then((cursor) => cursor.toArray())
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
            .then((collection) => {
              tic = timer.tic()
              return collection.findOne(query)
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
            .then((collection) => {
              tic = timer.tic()
              return collection.findOne({ _id })
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
            .then((collection) => {
              tic = timer.tic()
              return collection.update({ _id: doc._id }, doc, { upsert: true })
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

module.exports = Mongo(mongoUrl).getModel

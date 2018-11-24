'use strict'

const url = require('url')

const debugTimer = require('debug')('fusion:timer:dao:mongo')

const timer = require('../../utils/timer')

const MongoClient = require('mongodb').MongoClient

// const { sendMetrics, METRIC_TYPES } = require('../../reporutils/send-metrics')

async function getNewConnection (mongoUrl) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongoUrl, (err, connection) => err ? reject(err) : resolve(connection))
  })
}

function Mongo (mongoUrl) {
  const dbName = url.parse(mongoUrl).pathname.replace(/^\/+/, '')

  let db
  async function getDatabase () {
    if (db instanceof Promise) {
      return db
    } else if (db && db.topology.isConnected()) {
      return Promise.resolve(db)
    }

    // keep this in Promise syntax due to caching impl
    db = getNewConnection(mongoUrl)
      .then((conn) => {
        db = conn.db(dbName)
        return db
      })

    return db
  }

  const collections = {}
  async function getCollection (collectionName) {
    if (collectionName in collections) {
      if (collections[collectionName] instanceof Promise) {
        return collections[collectionName]
      } else if (collections[collectionName].s.topology.isConnected()) {
        return Promise.resolve(collections[collectionName])
      }
    }

    // keep this in Promise syntax due to caching impl
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

        async find (query) {
          const collection = await getCollection(modelName)

          const tic = timer.tic()
          const cursor = await collection.find(query)
          const data = await cursor.toArray()
          const elapsedTime = tic.toc()
          debugTimer(`${modelName}.find()`, elapsedTime)

          // sendMetrics([
          //   { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tag: ['operation:find'] },
          //   { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['operation:find', 'result:success'] }
          // ])

          return data
        },

        async findOne (query) {
          const collection = await getCollection(modelName)

          const tic = timer.tic()
          const data = await collection.findOne(query)
          const elapsedTime = tic.toc()
          debugTimer(`${modelName}.findOne()`, elapsedTime)

          // sendMetrics([
          //   { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tags: ['operation:findOne'] },
          //   { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['result:success', 'operation:findOne'] }
          // ])

          return data
        },

        async get (_id) {
          const collection = await getCollection(modelName)

          const tic = timer.tic()
          const data = await collection.findOne({ _id })
          const elapsedTime = tic.toc()
          debugTimer(`${modelName}.get(${_id})`, elapsedTime)

          // sendMetrics([
          //   { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tags: ['operation:get'] },
          //   { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['operation:get', 'result:success'] }
          // ])

          return data
        },

        async put (doc) {
          const collection = await getCollection(modelName)

          const tic = timer.tic()
          const data = await collection.update({ _id: doc._id }, doc, { upsert: true })
          const elapsedTime = tic.toc()
          debugTimer(`${modelName}.put()`, elapsedTime)

          // sendMetrics([
          //   { type: METRIC_TYPES.DB_DURATION, value: elapsedTime, tags: ['operation:put'] },
          //   { type: METRIC_TYPES.DB_RESULT, value: 1, tags: ['operation:put', 'result:success'] }
          // ])

          return data
        }
      }

      return models[modelName]
    }
  }
}

module.exports = (env) => {
  return Mongo(env.mongoUrl).getModel
}

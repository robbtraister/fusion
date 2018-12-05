'use strict'

const url = require('url')

const MongoClient = require('mongodb').MongoClient

const metricsWrapper = require('../_shared/metrics')

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
      models[modelName] = models[modelName] ||
        {
          name: modelName,

          ...metricsWrapper({
            async find (query) {
              const collection = await getCollection(modelName)
              const cursor = await collection.find(query)
              return cursor.toArray()
            },

            async findOne (query) {
              const collection = await getCollection(modelName)
              return collection.findOne(query)
            },

            async get (_id) {
              const collection = await getCollection(modelName)
              return collection.findOne({ _id })
            },

            async put (doc) {
              const collection = await getCollection(modelName)
              return collection.update({ _id: doc._id }, doc, { upsert: true })
            }
          })
        }

      return models[modelName]
    }
  }
}

module.exports = Mongo

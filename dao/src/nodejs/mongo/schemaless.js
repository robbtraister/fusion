'use strict'

const url = require('url')

const mongoUrls = require('./urls')

const MongoClient = require('mongodb').MongoClient

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

        find (query, limit) {
          return getCollection(modelName)
            .then((collection) => collection.find(query))
            .then((cursor) => (limit)
              ? cursor.limit(limit)
              : cursor
            )
            .then((cursor) => cursor.toArray())
        },

        findById (_id) {
          return getCollection(modelName)
            .then((collection) => collection.findOne({_id}))
        },

        findOne (query) {
          return getCollection(modelName)
            .then((collection) => collection.findOne(query))
        }
      }

      return models[modelName]
    }
  }
}

const mongos = {}
function getMongo (environment) {
  mongos[environment] = mongos[environment] || Mongo(mongoUrls[environment])
  return mongos[environment]
}
module.exports = getMongo

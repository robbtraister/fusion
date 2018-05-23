'use strict'

const url = require('url')

const debugTimer = require('debug')('fusion:timer:dao:mongo')

const { mongoUrl } = require('../../environment')

const timer = require('../timer')

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

        find (query) {
          let tic
          return getCollection(modelName)
            .then((collection) => {
              tic = timer.tic()
              return collection.find(query)
            })
            .then((cursor) => cursor.toArray())
            .then((data) => {
              debugTimer(`${modelName}.find()`, tic.toc())
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
              debugTimer(`${modelName}.findOne()`, tic.toc())
              return data
            })
        },

        get (_id) {
          let tic
          return getCollection(modelName)
            .then((collection) => {
              tic = timer.tic()
              return collection.findOne({_id})
            })
            .then((data) => {
              debugTimer(`${modelName}.get(${_id})`, tic.toc())
              return data
            })
        },

        put (doc) {
          let tic
          return getCollection(modelName)
            .then((collection) => {
              tic = timer.tic()
              return collection.update({_id: doc._id}, doc, { upsert: true })
            })
            .then((data) => {
              debugTimer(`${modelName}.put()`, tic.toc())
              return data
            })
        }
      }

      return models[modelName]
    }
  }
}

module.exports = Mongo(mongoUrl).getModel

'use strict'

const url = require('url')

const debugTimer = require('debug')('fusion:timer:renderings:schemaless')

const timer = require('../timer')

const MongoClient = require('mongodb').MongoClient
//
// function Mongo (mongoUrl) {
//   const dbName = url.parse(mongoUrl).pathname.replace(/^\/+/, '')
//
//   let db
//   function getDatabase () {
//     if (db instanceof Promise) {
//       return db
//     } else if (db && db.topology.isConnected()) {
//       return Promise.resolve(db)
//     }
//
//     db = new Promise((resolve, reject) => {
//       MongoClient.connect(mongoUrl, (err, connection) => err ? reject(err) : resolve(connection))
//     })
//       .then((conn) => {
//         db = conn.db(dbName)
//         return db
//       })
//
//     return db
//   }
//
//   const models = {}
//   return {
//     getModel (modelName) {
//       return () => {
//         if (modelName in models) {
//           if (models[modelName] instanceof Promise) {
//             return models[modelName]
//           } else if (models[modelName].s.topology.isConnected()) {
//             return Promise.resolve(models[modelName])
//           }
//         }
//
//         models[modelName] = getDatabase()
//           .then((db) => {
//             const collection = db.collection(modelName)
//
//             models[modelName] = {
//               find (query) {
//                 return collection.find(query)
//                   .then(cursor => cursor.toArray())
//               },
//
//               findById (_id) {
//                 return collection.findOne({_id})
//               }
//             }
//
//             return models[modelName]
//           })
//
//         return models[modelName]
//       }
//     }
//   }
// }

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

        findById (_id) {
          let tic
          return getCollection(modelName)
            .then((collection) => {
              tic = timer.tic()
              return collection.findOne({_id})
            })
            .then((data) => {
              debugTimer(`${modelName}.findById(${_id})`, tic.toc())
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
        }
      }

      return models[modelName]
    }
  }
}

module.exports = Mongo(process.env.MONGO_URL).getModel

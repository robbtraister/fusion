'use strict'

const url = require('url')

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
        find (query) {
          return getCollection(modelName)
            .then((collection) => collection.find(query))
            .then((cursor) => cursor.toArray())
        },

        findById (_id) {
          return getCollection(modelName)
            .then((collection) => collection.findOne({_id}))
        }
      }

      return models[modelName]
    }
  }
}

module.exports = Mongo(process.env.MONGO_URL).getModel

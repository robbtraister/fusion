'use strict'

const mongoose = require('mongoose')

const schema = new mongoose.Schema({_id: String})

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
        find (query) {
          return getCollection(modelName)
            .then((model) => model.find(query))
        },

        findById (_id) {
          return getCollection(modelName)
            .then((model) => model.findById(_id))
        }
      }

      return models[modelName]
    }
  }
}

module.exports = Mongoose(process.env.MONGO_URL).getModel

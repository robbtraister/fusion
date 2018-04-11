'use strict'

const mongoose = require('mongoose')

const debugTimer = require('debug')('fusion:timer:renderings:schemaless')

const { mongoUrl } = require('../environment')
const timer = require('../timer')

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
        name: modelName,

        find (query) {
          let tic
          return getCollection(modelName)
            .then((model) => {
              tic = timer.tic()
              return model.find(query)
            })
            .then((data) => {
              debugTimer(`${modelName}.find()`, tic.toc())
              return data
            })
        },

        findById (_id) {
          let tic
          return getCollection(modelName)
            .then((model) => {
              tic = timer.tic()
              return model.findById(_id)
            })
            .then((data) => {
              debugTimer(`${modelName}.findById(${_id})`, tic.toc())
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
              debugTimer(`${modelName}.findOne()`, tic.toc())
              return data
            })
        }
      }

      return models[modelName]
    }
  }
}

module.exports = Mongoose(mongoUrl).getModel

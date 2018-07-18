'use strict'

const dynamoose = require('dynamoose')

const {
  environment,
  region
} = require('../../../environment')

const db = new dynamoose.Dynamoose()
db.AWS.config.update({region})

const getSchema = modelName => {
  try {
    return require(`./schemas/${modelName}`)
  } catch (e) {
    return require(`./schemas/default`)
  }
}

const createModel = (modelName) => {
  const _model = db.model(`fusion.${environment}.${modelName}`, getSchema(modelName))

  return {
    get (id) {
      return _model.get((id instanceof Object) ? id : {id})
    },

    find () {
      return Promise.reject(new Error('not implemented'))
    },

    findOne () {
      return Promise.reject(new Error('not implemented'))
    },

    put (doc) {
      return new Promise((resolve, reject) => {
        const obj = new _model(doc)
        obj.put({}, (err, data) => (err ? reject(err) : resolve(data)))
      })
    }
  }
}

const models = {}
const getModel = function (modelName) {
  models[modelName] = models[modelName] || createModel(modelName)
  return models[modelName]
}

module.exports = getModel

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
      return _model.get({id})
    },

    find () {
      throw new Error('not implemented')
    },

    findOne () {
      throw new Error('not implemented')
    },

    put (doc) {
      return new Promise((resolve, reject) => {
        _model.create(Object.assign({}, doc), (err, data) => (err ? reject(err) : resolve(data)))
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

'use strict'

const dynamoose = require('dynamoose')

const {
  environment,
  region,
  version
} = require('../../environment')

const defaultSchema = new dynamoose.Schema(
  {
    version: {
      type: String,
      hashKey: true
    },
    id: {
      type: String,
      rangeKey: true
    }
  },
  { useDocumentTypes: true }
)

const db = new dynamoose.Dynamoose()
db.AWS.config.update({region})

const createModel = (modelName) => {
  const _model = db.model(`fusion.${environment}.${modelName}`, defaultSchema)

  return {
    get (id) {
      return _model.get({version, id})
    },

    find () {
      throw new Error('not implemented')
    },

    findOne () {
      throw new Error('not implemented')
    },

    put (doc) {
      return new Promise((resolve, reject) => {
        _model.save(Object.assign({}, doc, {version}), (err, data) => (err ? reject(err) : resolve(data)))
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

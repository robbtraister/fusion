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

const getModel = function (modelName) {
  const d = new dynamoose.Dynamoose()
  d.AWS.config.update({region})
  const model = d.model(`fusion.${environment}.${modelName}`, defaultSchema)

  return {
    get (id) {
      return model.get({version, id})
    },

    find () {
      throw new Error('not implemented')
    },

    findOne () {
      throw new Error('not implemented')
    },

    put (doc) {
      return new Promise((resolve, reject) => {
        model.save(Object.assign({}, doc, {version}), (err, data) => (err ? reject(err) : resolve(data)))
      })
    }
  }
}

module.exports = getModel

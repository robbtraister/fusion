'use strict'

const dynamoose = require('dynamoose')

const { environment, region } = require('../../../../environment')

const getSchema = modelName => {
  try {
    return require(`./schemas/${modelName}`)
  } catch (e) {
    return require(`./schemas/default`)
  }
}

const db = new dynamoose.Dynamoose()
db.AWS.config.update({ region })

const createModel = (modelName) => {
  const _model = db.model(`fusion.${environment}.${modelName}`, getSchema(modelName))

  return {
    get (id) {
      return _model.get((id instanceof Object) ? id : { id })
    },

    find (query) {
      return new Promise((resolve, reject) => {
        const result = []

        function scan (lastKey) {
          _model.scan(query).startAt(lastKey).exec((err, data) => {
            if (err) {
              return reject(err)
            } else {
              Array.prototype.push.apply(result, data)

              if (data.lastKey) {
                scan(data.lastKey)
              } else {
                resolve(result)
              }
            }
          })
        }

        scan()
      })
    },

    findOne (query) {
      return new Promise((resolve, reject) => {
        _model.scan(query).exec((err, data) => {
          (err)
            ? reject(err)
            : resolve(data && data[0])
        })
      })
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

module.exports = {
  getModel
}

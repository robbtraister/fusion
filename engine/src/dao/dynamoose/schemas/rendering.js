'use strict'

const dynamoose = require('dynamoose')

const generate = (type) => new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true
    },
    type: {
      type: String,
      default: type
    },
    layout: {
      type: String
    },
    layoutItems: {
      type: Object
    }
  },
  { useDocumentTypes: true }
)

module.exports = generate('rendering')
module.exports.generate = generate

'use strict'

const dynamoose = require('dynamoose')

module.exports = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true
    },
    version: {
      type: String,
      rangeKey: true
    },
    hash: {
      type: String
    }
  },
  { useDocumentTypes: true }
)

'use strict'

const dynamoose = require('dynamoose')

module.exports = new dynamoose.Schema(
  {
    id: {
      type: String,
      rangeKey: true
    },
    version: {
      type: String,
      hashKey: true
    },
    cssFile: {
      type: String
    }
  },
  { useDocumentTypes: true }
)

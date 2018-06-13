'use strict'

const dynamoose = require('dynamoose')

module.exports = new dynamoose.Schema(
  {
    id: {
      type: String,
      rangeKey: true
    }
  },
  { useDocumentTypes: true }
)

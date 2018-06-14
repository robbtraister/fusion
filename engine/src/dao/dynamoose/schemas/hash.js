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
      index: {
        global: false
      }
    },
    cssFile: {
      type: String
    }
  },
  { useDocumentTypes: true }
)

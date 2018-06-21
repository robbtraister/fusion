'use strict'

const dynamoose = require('dynamoose')

module.exports = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true
    },
    layout: {
      type: String
    },
    layoutItems: {
      type: Object
    },
    meta: {
      type: Object
    }
  },
  { useDocumentTypes: true }
)

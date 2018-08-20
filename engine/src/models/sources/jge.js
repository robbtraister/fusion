'use strict'

const model = require('../../dao')

const {
  isDev
} = require('../../../environment')

module.exports = (isDev)
  ? {
    find () {
      return model('jge_config').find()
    },

    get (sourceName) {
      return model('jge_config').get(sourceName)
    }
  }
  : {
    find () {
      return Promise.resolve([])
    },

    get (sourceName) {
      return Promise.resolve(null)
    }
  }

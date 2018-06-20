'use strict'

const model = require('../../dao')

module.exports = {
  find () {
    return model('jge_config').find()
  },

  get (sourceName) {
    return model('jge_config').get(sourceName)
  }
}

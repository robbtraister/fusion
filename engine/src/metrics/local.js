'use strict'

const logger = require('debug')

module.exports = (data) => {
  Object.keys(data)
    .forEach((key) => {
      logger(key)(data[key])
    })
}

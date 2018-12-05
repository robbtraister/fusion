'use strict'

const logger = require('debug')

function sendMetrics (data) {
  Object.keys(data)
    .forEach((key) => {
      logger(key)(data[key])
    })
}

// no-op on local
const resolveMetrics = () => {}

module.exports = sendMetrics
module.exports.sendMetrics = sendMetrics
module.exports.resolveMetrics = resolveMetrics

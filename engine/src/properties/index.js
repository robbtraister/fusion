'use strict'

const path = require('path')

const { buildRoot } = require('../../environment')

module.exports = {
  getProperties: require(path.resolve(buildRoot, 'properties'))
}

'use strict'

const path = require('path')

module.exports = (env) => {
  const { buildRoot } = env

  return {
    getProperties: require(path.resolve(buildRoot, 'properties'))
  }
}

'use strict'

const path = require('path')

module.exports = (env) => {
  const { generatedRoot } = env

  return path.resolve(generatedRoot, 'properties.js')
}

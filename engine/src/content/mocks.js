'use strict'

const mockRequire = require('mock-require')

module.exports = (env) => {
  const { getProperties, variables } = env

  mockRequire('fusion:environment', variables)
  mockRequire('fusion:properties', getProperties)
}

'use strict'

const mockRequire = require('mock-require')
mockRequire('fusion:consumer', {})
mockRequire('fusion:content', {})
mockRequire('fusion:context', {})
mockRequire('fusion:environment', {})
mockRequire('fusion:properties', {})

module.exports = (env) =>
  [].concat(
    require('./components')(env),
    require('./content')(env),
    require('./properties')(env)
  )

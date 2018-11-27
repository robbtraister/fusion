'use strict'

const mockRequire = require('mock-require')
mockRequire('fusion:consumer', () => {})
mockRequire('fusion:content', () => {})
mockRequire('fusion:context', () => {})
mockRequire('fusion:environment', {})
mockRequire('fusion:layout', () => {})
mockRequire('fusion:properties', {})
mockRequire('fusion:prop-types', {})
mockRequire('fusion:static', {})

module.exports =
  [].concat(
    require('./components'),
    require('./content'),
    require('./properties')
  )

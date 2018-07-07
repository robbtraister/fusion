'use strict'

const mockRequire = require('mock-require')

const FusionPropTypes = require('./fusion')

mockRequire('PropTypes', FusionPropTypes)
mockRequire('prop-types', FusionPropTypes)

module.exports = FusionPropTypes

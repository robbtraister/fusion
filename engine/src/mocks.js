'use strict'

const mockRequire = require('mock-require')

const { getProperties } = require('./properties')
const { variables } = require('../environment')

mockRequire('fusion:environment', variables)
mockRequire('fusion:properties', getProperties)

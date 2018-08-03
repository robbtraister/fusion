'use strict'

const path = require('path')

const mockRequire = require('mock-require')

const {
  bundleDistRoot,
  variables: FusionEnvironment
} = require('../environment')

require('./shared')

mockRequire('fusion:environment', FusionEnvironment)

const FusionProperties = require(path.resolve(bundleDistRoot, 'properties'))
mockRequire('fusion:properties', FusionProperties)

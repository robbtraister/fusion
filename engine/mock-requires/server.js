'use strict'

const path = require('path')

const mockRequire = require('mock-require')

const {
  bundleDistRoot,
  variables: FusionEnvironment
} = require('../environment')

require('./shared')

mockRequire('fusion:environment', FusionEnvironment)

const FusionVariables = require(path.resolve(bundleDistRoot, 'variables'))
mockRequire('fusion:variables', FusionVariables)

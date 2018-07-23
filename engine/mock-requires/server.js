'use strict'

const path = require('path')

const mockRequire = require('mock-require')

const {
  bundleGeneratedRoot,
  variables: FusionEnvironment
} = require('../environment')

require('./shared')

mockRequire('fusion:environment', FusionEnvironment)

const FusionVariables = require(path.resolve(bundleGeneratedRoot, 'variables'))
mockRequire('fusion:variables', FusionVariables)

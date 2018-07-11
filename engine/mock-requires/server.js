'use strict'

require('./client')

const mockRequire = require('mock-require')

const FusionEnvironment = require('../environment').variables
mockRequire('fusion:environment', FusionEnvironment)

const FusionVariables = require('../generated/variables')
mockRequire('fusion:variables', FusionVariables)

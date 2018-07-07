'use strict'

const mockRequire = require('mock-require')

const FusionPropTypes = require('../src/react/shared/prop-types')
mockRequire('prop-types', FusionPropTypes)

const FusionConsumer = require('../src/react/shared/components/consumer')
mockRequire('fusion:consumer', FusionConsumer)

const FusionStatic = require('../src/react/shared/components/static')
mockRequire('fusion:static', FusionStatic)

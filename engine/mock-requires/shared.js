'use strict'

const mockRequire = require('mock-require')

const FusionPropTypes = require('../src/react/shared/prop-types')
mockRequire('prop-types', FusionPropTypes)

const FusionConsumer = require('../src/react/shared/components/consumer')
mockRequire('fusion:consumer', FusionConsumer)

const FusionContent = require('../src/react/shared/components/content')
mockRequire('fusion:content', FusionContent)

const FusionContext = require('../src/react/shared/components/context')
mockRequire('fusion:context', FusionContext)

const FusionLayout = require('../src/react/shared/components/layout')
mockRequire('fusion:layout', FusionLayout)

const FusionStatic = require('../src/react/shared/components/static')
mockRequire('fusion:static', FusionStatic)

'use strict'

const path = require('path')

const mockRequire = require('mock-require')

const {
  bundleDistRoot,
  componentDistRoot,
  variables: FusionEnvironment
} = require('../environment')

require('./shared')

mockRequire('fusion:environment', FusionEnvironment)

// const FusionManifest = require('../manifest')
// mockRequire('fusion:manifest', FusionManifest)

;[
  'chains',
  'features',
  'layouts',
  'output-types'
]
  .forEach(collection => {
    mockRequire(`fusion:manifest:components:${collection}`, require(`${componentDistRoot}/${collection}/fusion.manifest.json`))
  })

const FusionProperties = require(path.resolve(bundleDistRoot, 'properties'))
mockRequire('fusion:properties', FusionProperties)

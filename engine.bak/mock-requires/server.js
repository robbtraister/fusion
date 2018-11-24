'use strict'

const path = require('path')

const mockRequire = require('mock-require')
const React = require('react')

const {
  bundleBuildRoot,
  componentBuildRoot,
  variables: FusionEnvironment
} = require('../environment')

require('./shared')

mockRequire('react', React)
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
    mockRequire(`fusion:manifest:components:${collection}`, require(`${componentBuildRoot}/${collection}/fusion.manifest.json`))
  })

const FusionProperties = require(path.resolve(bundleBuildRoot, 'properties'))
mockRequire('fusion:properties', FusionProperties)

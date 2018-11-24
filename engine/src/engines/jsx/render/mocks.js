'use strict'

const mockRequire = require('mock-require')

const PropTypes = require('@arc-fusion/prop-types')
const React = require('react')
const ReactDOM = require('react-dom')

mockRequire('prop-types', PropTypes)
mockRequire('react', React)
mockRequire('react-dom', ReactDOM)

const ConsumerComponent = require('../components/consumer')
const ContentComponent = require('../components/content')
const ContextComponent = require('../components/context')
// const LayoutComponent = require('./components/layout')
// const StaticComponent = require('./components/static')

mockRequire('fusion:consumer', ConsumerComponent)
mockRequire('fusion:content', ContentComponent)
mockRequire('fusion:context', ContextComponent)
// mockRequire('fusion:layout', LayoutComponent)
// mockRequire('fusion:static', StaticComponent)

module.exports = (env) => {
  const { getProperties, variables } = env

  mockRequire('fusion:environment', variables)
  mockRequire('fusion:properties', getProperties)
}

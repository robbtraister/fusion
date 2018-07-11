'use strict'

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const isStatic = require('../is-static')
const unpack = require('../../../utils/unpack')

const timer = require('../../../timer')

const { components } = require('../../../../environment/manifest')

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  debugTimer(`render(${props.type}:${props.id})`, tic.toc())
  return result
}

const loadComponent = function loadComponent (componentType, componentName, outputType) {
  try {
    const componentConfig = components[componentType][componentName]
    const componentOutputType = componentConfig.outputTypes[outputType] || componentConfig.outputTypes.default
    const OriginalComponent = unpack(require(componentOutputType.dist))
    const Component = (isStatic(OriginalComponent, outputType))
      ? (props) => React.createElement('div', { id: props.id, className: 'fusion:static' }, React.createElement(OriginalComponent, props))
      : OriginalComponent
    return TimedComponent(Component)
  } catch (e) {}
  return null
}

module.exports = require('../../shared/compile/component')(loadComponent)

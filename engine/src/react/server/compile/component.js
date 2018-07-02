'use strict'

const debugTimer = require('debug')('fusion:timer:react:component')

const React = global.react = require('react')

const Consumer = require('../../shared/consumer')
const unpack = require('../../shared/unpack')

const timer = require('../../../timer')

const { components } = require('../../../../environment/bundle')

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  debugTimer(`render(${props.type}:${props.id})`, tic.toc())
  return result
}

const loadComponent = function loadComponent (componentType, componentName, outputType) {
  try {
    const componentConfig = components[componentType][componentName]
    const componentOutputType = componentConfig[outputType] || componentConfig.default
    const Component = unpack(require(componentOutputType.dist))
    const ConsumerComponent = (componentType === 'features')
      ? Consumer(Component)
      : Component
    return TimedComponent(ConsumerComponent)
  } catch (e) {}
  return null
}

module.exports = require('../../shared/compile/component')(loadComponent)

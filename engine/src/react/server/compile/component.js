'use strict'

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const isStatic = require('../is-static')
const Layout = require('../../shared/components/layout')
const unpack = require('../../../utils/unpack')

const timer = require('../../../timer')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')

const { components } = require('../../../../environment/manifest')

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  const elapsedTime = tic.toc()
  debugTimer(`render(${props.type}:${props.id})`, elapsedTime)
  sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: elapsedTime, tags: ['render:component']}])
  return result
}

const loadComponent = function loadComponent (componentType, componentName, outputType) {
  try {
    const componentConfig = components[componentType][componentName]
    const componentOutputType = componentConfig.outputTypes[outputType] || componentConfig.outputTypes.default
    const UnpackedComponent = unpack(require(componentOutputType.dist))
    const OriginalComponent = (componentType === 'layouts')
      ? Layout(UnpackedComponent)
      : UnpackedComponent
    const Component = (isStatic(OriginalComponent, outputType))
      ? (props) => React.createElement('div', { id: props.id, className: 'fusion:static' }, React.createElement(OriginalComponent, props))
      : OriginalComponent
    return TimedComponent(Component)
  } catch (e) {}
  return null
}

module.exports = require('../../shared/compile/component')(loadComponent)

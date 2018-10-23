'use strict'

const path = require('path')

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const isStatic = require('../utils/is-static')
const Layout = require('../../shared/components/layout')
const unpack = require('../../../utils/unpack')

const timer = require('../../../timer')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')
const { LOG_TYPES, ...logger } = require('../../../utils/logger')

const { bundleRoot } = require('../../../../environment')

const { components } = require('../../../../manifest')

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  const elapsedTime = tic.toc()
  debugTimer(`render(${props.type}:${props.id})`, elapsedTime)
  sendMetrics([{ type: METRIC_TYPES.RENDER_DURATION, value: elapsedTime, tags: ['render:component'] }])
  return result
}

function loadComponent (componentCollection, componentType) {
  if (componentCollection && componentType) {
    try {
      const componentConfig = components[componentCollection][componentType]
      const manifest = componentConfig.outputTypes[this.outputType]
      const UnpackedComponent = unpack(require(path.join(bundleRoot, manifest.dist)))
      const OriginalComponent = (componentCollection === 'layouts')
        ? Layout(UnpackedComponent)
        : UnpackedComponent
      const Component = (isStatic(OriginalComponent, this.outputType))
        ? (props) => React.createElement('div', { id: props.id, className: 'fusion:static' }, React.createElement(OriginalComponent, props))
        : OriginalComponent
      return TimedComponent(Component)
    } catch (e) {
      logger.logError({ logType: LOG_TYPES.COMPONENT, message: 'An error occurred while attempting to load a component.', stackTrace: e.stack })
    }
  }
  return null
}

module.exports = loadComponent

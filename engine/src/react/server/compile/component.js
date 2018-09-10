'use strict'

const debugTimer = require('debug')('fusion:timer:react:component')

const React = require('react')

const ComponentGenerator = require('../../shared/compile/component')

const isStatic = require('../utils/is-static')
const Layout = require('../../shared/components/layout')
const unpack = require('../../../utils/unpack')

const timer = require('../../../timer')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')

const { components } = require('../../../../manifest')

const TimedComponent = (Component) => (props) => {
  const tic = timer.tic()
  const result = React.createElement(Component, props)
  const elapsedTime = tic.toc()
  debugTimer(`render(${props.type}:${props.id})`, elapsedTime)
  sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: elapsedTime, tags: ['render:component']}])
  return result
}

class ServerGenerator extends ComponentGenerator {
  loadComponent (componentCollection, componentType) {
    try {
      const componentConfig = components[componentCollection][componentType]
      const componentOutputType = this.outputTypes.find((outputType) => componentConfig.outputTypes[outputType])
      const manifest = componentConfig.outputTypes[componentOutputType]
      const UnpackedComponent = unpack(require(manifest.dist))
      const OriginalComponent = (componentCollection === 'layouts')
        ? Layout(UnpackedComponent)
        : UnpackedComponent
      const Component = (isStatic(OriginalComponent, componentOutputType))
        ? (props) => React.createElement('div', { id: props.id, className: 'fusion:static' }, React.createElement(OriginalComponent, props))
        : OriginalComponent
      return TimedComponent(Component)
    } catch (e) {}
    return null
  }
}

const generatorCache = {}
module.exports = (renderable, outputTypes) => {
  const outputType = outputTypes[0]
  const generator = generatorCache[outputType] = generatorCache[outputType] || new ServerGenerator(outputType)
  return generator.generate(renderable)
}

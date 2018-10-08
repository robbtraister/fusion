'use strict'

const ComponentCompiler = require('../../shared/compile/component')

const loadComponent = require('./load-component')

class ServerCompiler extends ComponentCompiler {}
ServerCompiler.prototype.loadComponent = loadComponent

<<<<<<< HEAD
const isStatic = require('../utils/is-static')
const Layout = require('../../shared/components/layout')
const unpack = require('../../../utils/unpack')

const timer = require('../../../timer')

const { sendMetrics, METRIC_TYPES } = require('../../../utils/send-metrics')
const { logError, LOG_TYPES } = require('../../../utils/logger')

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
      const manifest = componentConfig.outputTypes[this.outputType]
      const UnpackedComponent = unpack(require(manifest.dist))
      const OriginalComponent = (componentCollection === 'layouts')
        ? Layout(UnpackedComponent)
        : UnpackedComponent
      const Component = (isStatic(OriginalComponent, this.outputType))
        ? (props) => React.createElement('div', { id: props.id, className: 'fusion:static' }, React.createElement(OriginalComponent, props))
        : OriginalComponent
      return TimedComponent(Component)
    } catch (error) {
      logError({logType: LOG_TYPES.RENDERING, message: `Unable to load component: ${error.stack || error}`})
    }
    return null
  }
}

const generatorCache = {}
module.exports = (renderable, outputType) => {
  const generator = generatorCache[outputType] = generatorCache[outputType] || new ServerGenerator(outputType)
  return generator.generate(renderable)
}
=======
module.exports = (renderable, outputType) =>
  new ServerCompiler(renderable, outputType).compile()
>>>>>>> master

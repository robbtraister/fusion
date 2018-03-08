'use strict'

const path = require('path')

const debug = require('debug')('fusion:timer:react:component')

const React = require('react')

const timer = require('../timer')

const TimedComponent = function TimedComponent (Component) {
  if (Component.prototype instanceof React.Component) {
    let tic
    return class TimedComponent extends Component {
      constructor (props, context) {
        super(props, context)
        tic = timer.tic()
      }
      render () {
        const result = super.render()
        debug(this.props.type, this.props.id, tic.toc())
        return result
      }
    }
  } else {
    const TimedComponent = function TimedComponent (props, context) {
      const tic = timer.tic()
      const result = Component(props, context)
      debug(props.type, props.id, tic.toc())
      return result
    }
    TimedComponent.contextTypes = Component.contextTypes
    return TimedComponent
  }
}

const componentRoot = path.resolve(process.env.COMPONENT_ROOT || `${__dirname}/../../dist/components`)

const renderAll = function renderAll (renderableItems) {
  return (renderableItems || [])
    .map(renderableItem)
    .filter(ri => ri)
}

const feature = function feature (config) {
  const contentConfigValues = (config.contentConfig && config.contentConfig.contentConfigValues) || {}
  const customFields = config.customFields || {}

  try {
    const component = TimedComponent(require(`${componentRoot}/features/${config.featureConfig}.jsx`))
    const props = Object.assign({key: config.id, id: config.id, type: config.featureConfig}, customFields, contentConfigValues)

    return React.createElement(
      component,
      props
    )
  } catch (e) {
    // console.error(e)
    return null
  }
}

const chain = function chain (config) {
  const component = (() => {
    try {
      return TimedComponent(require(`${componentRoot}/chains/${config.chainConfig}.jsx`))
    } catch (e) {
      return 'div'
    }
  })()

  return React.createElement(
    component,
    {key: config.id, id: config.id, type: config.chainConfig},
    renderAll(config.features)
  )
}

const section = function section (config) {
  return React.createElement(
    'section',
    {},
    renderAll(config.renderableItems)
  )
}

const renderableItem = function renderableItem (config) {
  return (config.featureConfig) ? feature(config)
    : (config.chainConfig) ? chain(config)
      : (config.renderableItems) ? section(config)
        : null
}

const compile = function compile (rendering) {
  const component = (() => {
    try {
      return require(`${componentRoot}/layouts/${rendering.layout}.jsx`)
    } catch (e) {
      return 'div'
    }
  })()

  const children = rendering.layoutItems.map(renderableItem)

  return (props) => React.createElement(
    component,
    props,
    children
  )
}

module.exports = compile

'use strict'

const path = require('path')

const BaseLoader = require('../_shared/loaders/base-loader')
const componentFactory = require('../_shared/loaders/component-loader')
const fallbackFactory = require('../_shared/fallbacks')

const unpack = require('../_shared/unpack')

class JsLoader extends BaseLoader {
  constructor (loaderOptions) {
    super()

    this.loadComponent = componentFactory(loaderOptions)
  }

  createElement (node) {
    const Component = this.loadComponent(node)
    if (Component) {
      try {
        return Component({
          ...node.props,
          children: this.createChildren(node)
        })
      } catch (err) {
        console.error(err)
        return ''
      }
    }
  }

  createChildren (node) {
    // join with an empty string to prevent the default comma delimiter
    return super.createChildren(node).join('')
  }
}

module.exports = (env) => (ext) => {
  const { buildRoot } = env

  const getFallbacks = fallbackFactory(env)

  return function renderJs (outputTypePath, props, callback) {
    try {
      delete props.settings
      delete props.cache
      delete props._locals

      const OutputType = unpack(require(outputTypePath))
      const loader = new JsLoader({
        componentRoot: path.resolve(buildRoot, 'components'),
        ext,
        outputTypes: getFallbacks({
          ext,
          outputType: props.outputType
        })
      })

      callback(
        null,
        OutputType({
          ...props,
          children: loader.createChildren(props)
        })
      )
    } catch (err) {
      callback(err)
    }
  }
}

'use strict'

const path = require('path')

const BaseLoader = require('../_shared/loaders/base-loader')
const componentFactory = require('../_shared/loaders/component-loader')
const getFallbacks = require('../_shared/fallbacks')
const getRenderables = require('../_shared/renderables')
const substitute = require('../_shared/substitute')
const getTree = require('../_shared/rendering-to-tree')

const unpack = require('../_shared/unpack')

const { buildRoot } = require('../../../environment')

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
    const children = super.createChildren(node)
    // join with an empty string to prevent the default comma delimiter
    children.toString = () => children.join('')
    return children
  }
}

module.exports = (ext) => {
  return function renderJs (outputTypePath, props, callback) {
    try {
      delete props.settings
      delete props.cache
      delete props._locals

      const OutputType = unpack(require(outputTypePath))
      props.tree = substitute(getTree(props), props)
      props.renderables = getRenderables(props.tree)

      const loader = new JsLoader({
        componentRoot: path.resolve(buildRoot, 'components'),
        ext,
        outputTypes: getFallbacks({
          ext,
          outputType: props.outputType
        })
      })

      const children = loader.createElement(props.tree)

      callback(
        null,
        OutputType({
          ...props,
          children
        })
      )
    } catch (err) {
      callback(err)
    }
  }
}

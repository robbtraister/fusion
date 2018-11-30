'use strict'

const BaseLoader = require('../_shared/loaders/base-loader')
const componentFactory = require('../_shared/loaders/component-loader')

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

module.exports = JsLoader

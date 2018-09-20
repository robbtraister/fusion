'use strict'

const React = require('react')

const getTree = require('./tree')

class ComponentCompiler {
  constructor (renderable, outputType) {
    this.renderable = renderable
    this.outputType = outputType

    this.emptyElement = () => null

    this.collectionMap = {
      chains: this.getComponent(),
      features: this.getFeature.bind(this),
      layouts: this.getComponent(),
      sections: this.getComponent(React.Fragment)
    }
  }

  compile () {
    const tree = getTree(this.renderable, this.outputType)

    // The calculated result we export for rendering must be a Component (not Element)
    // Also, react elements cannot be extended, so using a Component function allows us to add layout property
    const Component = () => this.renderableItem(tree)

    Component.id = this.renderable.id
    if (tree.layout) {
      Component.layout = tree.layout
    }
    Component.tree = tree

    return Component
  }

  getComponent (defaultComponent = 'div') {
    return (node) => {
      const Component = this.loadComponent(node.collection, node.type) || defaultComponent

      const props = (Component === React.Fragment)
        ? { key: node.props.key || node.props.id }
        : node.props

      return React.createElement(
        Component,
        props,
        this.renderAll(node.children)
      )
    }
  }

  getFeature (node) {
    const Feature = this.loadComponent(node.collection, node.type)

    return (Feature)
      ? React.createElement(
        Feature,
        node.props
      )
      : React.createElement(
        'div',
        {
          key: node.props.id,
          type: node.props.type,
          id: node.props.id,
          name: node.props.name,
          'data-fusion-message': `feature [${node.type}] could not be found`
        }
      )
  }

  loadComponent () {
    throw new Error('`loadComponent` is not defined')
  }

  renderAll (renderableItems) {
    return (renderableItems || [])
      .map((renderableItem) => this.renderableItem(renderableItem))
      .filter(renderableItem => renderableItem)
  }

  renderableItem (node) {
    const Component = this.collectionMap[node.collection]

    const Element = (Component)
      ? Component(node)
      : null

    return Element || this.emptyElement
  }
}

module.exports = ComponentCompiler

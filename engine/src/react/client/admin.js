'use strict'

/* global Fusion */

require('./shared')
Fusion.isAdmin = true

const Provider = require('./provider')

const React = window.react
const ReactDOM = window.ReactDOM

// support fragments in preact
React.Fragment = React.Fragment || 'div'

const appendBoundary = (element, id) => {
  const boundaryProps = {
    'data-fusion-component': id,
    style: { display: 'none' }
  }
  return React.createElement(
    React.Fragment,
    {},
    [
      React.createElement(
        'fusion-enter',
        Object.assign(
          { id: `fusion-enter-${id}` },
          boundaryProps
        )
      ),
      element,
      React.createElement(
        'fusion-exit',
        Object.assign(
          { id: `fusion-exit-${id}` },
          boundaryProps
        )
      )
    ]
  )
}

const ComponentCompiler = require('../shared/compile/component')
class AdminCompiler extends ComponentCompiler {
  loadComponent (componentCollection, componentType) {
    try {
      return Fusion.components[componentCollection][componentType]
    } catch (e) {}
    return null
  }

  getComponent (defaultComponent = 'div') {
    const _getComponent = super.getComponent(defaultComponent)

    return (node) => {
      return (node.collection === 'chains')
        ? appendBoundary(_getComponent(node), node.props.id)
        : _getComponent(node)
    }
  }

  getFeature (node) {
    return appendBoundary(super.getFeature(node), node.props.id)
  }
}

window.render = function render (rendering) {
  const elem = window.document.getElementById('fusion-app')
  // const html = elem.innerHTML
  try {
    ReactDOM.render(
      React.createElement(
        Provider,
        {
          isAdmin: true,
          layout: rendering.layout
        },
        React.createElement(
          new AdminCompiler(rendering, Fusion.outputType).compile(),
          Fusion.globalContent || {}
        )
      ),
      elem
    )
  } catch (e) {
    // elem.innerHTML = html
    // don't catch this like in production
    throw e
  }
}

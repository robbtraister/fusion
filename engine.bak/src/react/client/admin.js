'use strict'

/* global Fusion */

require('./shared')

const Provider = require('./provider')

const React = window.react
const ReactDOM = window.ReactDOM

const ErrorDisplay = ({ error, footer, name }) =>
  React.createElement(
    'div',
    {
      style: {
        background: 'repeating-linear-gradient(-45deg, #fee, #fee 10px, #fff 10px, #fff 20px)',
        backgroundColor: '#fee',
        border: '2px dashed #e00',
        color: '#c00',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '20px',
        padding: '10px',
        textAlign: 'left'
      }
    },
    [
      React.createElement(
        'h2',
        {
          key: 'title',
          style: {
            textAlign: 'inherit',
            fontFamily: 'inherit',
            fontSize: '18px',
            fontWeight: '600',
            padding: '0px',
            margin: '0px'
          }
        },
        'Component Code Error'
      ),
      React.createElement(
        'p',
        {
          key: 'body',
          style: {
            textAlign: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontStyle: 'inherit',
            fontWeight: 'inherit',
            lineHeight: 'inherit',
            margin: '10px 0',
            padding: '0px'
          }
        },
        `An error occurred while rendering ${name}.`
      ),
      (error && error.message) || error,
      (footer)
        ? React.createElement(
          'div',
          {},
          footer
        )
        : null
    ]
  )

Fusion.isAdmin = true
Fusion.components.Quarantine = require('../shared/components/quarantine')(ErrorDisplay)

const appendBoundary = (element, id) => {
  const boundaryProps = {
    'data-fusion-component': id,
    style: { display: 'none' }
  }
  return React.createElement(
    React.Fragment,
    {
      key: id
    },
    [
      React.createElement(
        'fusion-enter',
        Object.assign(
          {
            id: `fusion-enter-${id}`,
            key: `fusion-enter-${id}`
          },
          boundaryProps
        )
      ),
      element,
      React.createElement(
        'fusion-exit',
        Object.assign(
          {
            id: `fusion-exit-${id}`,
            key: `fusion-exit-${id}`
          },
          boundaryProps
        )
      )
    ]
  )
}

const ComponentCompiler = require('../shared/compile/component')
class AdminCompiler extends ComponentCompiler {
  constructor (renderable, outputType) {
    super(renderable, outputType)

    this.createElement = Fusion.createElement
  }

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

function showLayoutError (layoutName, error) {
  const shade = document.createElement('div')
  shade.style.backgroundColor = 'rgba(0,0,0,0.5)'
  shade.style.bottom = '0'
  shade.style.left = '0'
  shade.style.position = 'fixed'
  shade.style.right = '0'
  shade.style.top = '0'
  shade.style.zIndex = '99999999'
  document.getElementById('fusion-app').appendChild(shade)

  ReactDOM.render(
    React.createElement(
      'div',
      {
        style: {
          left: '50%',
          maxWidth: '500px',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }
      },
      React.createElement(
        ErrorDisplay,
        {
          name: layoutName,
          error,
          footer: 'Please correct issue to continue editing'
        }
      )
    ),
    shade
  )
}

window.render = function render (rendering) {
  const elem = window.document.getElementById('fusion-app')
  const html = elem.innerHTML
  try {
    Fusion.components.Consumer.labelContent(Fusion.globalContent)

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
  } catch (err) {
    elem.innerHTML = html
    showLayoutError(rendering.layout, err)

    throw err
  }
}

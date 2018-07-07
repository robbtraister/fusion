'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

const React = window.React = require('react')
const ReactDOM = window.ReactDOM = require('react-dom')
window.PropTypes = require('../shared/prop-types/fusion')

// support fragments in preact
React.Fragment = React.Fragment || 'div'

const Provider = require('./provider')
const Consumer = require('../shared/consumer')

const getComponent = (componentType, componentName) => {
  const Component = Fusion.components[componentType][componentName]

  return (Component && componentType === 'features')
    ? Consumer(Component)
    : Component
}

const getElement = require('../shared/compile/component')(getComponent)

function render (config) {
  ReactDOM.render(
    React.createElement(
      Provider,
      {
        isAdmin: true
      },
      React.createElement(
        getElement(config),
        Fusion.globalContent || {}
      )
    ),
    window.document.getElementById('fusion-app')
  )
}

window.render = render

module.exports = React

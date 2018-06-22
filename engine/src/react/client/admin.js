'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

const React = require('react')

// support fragments in preact
React.Fragment = React.Fragment || 'div'
const ReactDOM = require('react-dom')

const Provider = require('./provider')
const Consumer = require('../shared/consumer')

const getComponent = (componentType, componentName, outputType) => {
  const Component = [
    Fusion.Components[componentType][`${componentName}/${outputType}`],
    Fusion.Components[componentType][`${componentName}/default`],
    Fusion.Components[componentType][`${componentName}/index`],
  ].filter(c => c).shift()

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

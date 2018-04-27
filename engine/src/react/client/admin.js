'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

const React = require('react')

// support fragments in preact
React.Fragment = React.Fragment || 'div'
const ReactDOM = require('react-dom')

const Provider = require('./provider')

const getComponent = (componentType, componentName, outputType) => {
  return Fusion.Components[componentType][componentName]
}

const getElement = require('../shared/compile/component')(getComponent)

function render (config) {
  ReactDOM.render(
    React.createElement(
      Provider,
      {},
      React.createElement(
        getElement(config),
        Fusion.globalContent || {}
      )
    ),
    window.document.getElementById('App')
  )
}

window.render = render

module.exports = React

'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

Fusion.components = Fusion.components || {}
Fusion.components.Consumer = require('../shared/components/consumer')
Fusion.components.Layout = require('../shared/components/layout')
Fusion.components.Static = require('../shared/components/static')
Fusion.unpack = require('../../utils/unpack')
Fusion.variables = require('fusion:variables')

const Provider = require('./provider')

const React = window.react = require('react')
const ReactDOM = window.ReactDOM = require('react-dom')
window.PropTypes = require('../shared/prop-types')

// support fragments in preact
React.Fragment = React.Fragment || 'div'

const getComponent = (componentType, componentName) =>
  Fusion.components[componentType][componentName]

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

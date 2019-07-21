'use strict'

const History = require('history')
const PropTypes = require('prop-types')
const React = require('react')
const ReactDOM = require('react-dom')
const ReactRouterDOM = require('react-router-dom')

const FusionComponents = require('../components')
const { App } = FusionComponents

window.History = History
window.PropTypes = PropTypes
window.React = React
window.ReactDOM = ReactDOM
window.ReactRouterDOM = ReactRouterDOM
window.FusionComponents = FusionComponents

const Fusion = (window.Fusion = window.Fusion || {})
Fusion.trees = Fusion.trees || {}

function getComponent ({ collection, type }) {
  try {
    return collection ? Fusion.components[collection][type] : type
  } catch (_) {
    return React.Fragment
  }
}

function render (context = {}, id = 'fusion-app') {
  const targetElement = document.getElementById(id)
  if (targetElement) {
    const serverHTML = targetElement.innerHTML
    try {
      ReactDOM[context.method || 'render'](
        React.createElement(App, {
          ...context,
          outputType: context.outputType || Fusion.outputType,
          tree: context.tree || Fusion.trees[context.template],
          getComponent
        }),
        targetElement
      )
    } catch (_) {
      targetElement.innerHTML = serverHTML
    }
  }
}

// window.addEventListener('DOMContentLoaded', () => render({ tree: Fusion.tree }))
Fusion.render = render

export default render

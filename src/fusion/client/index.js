'use strict'

const History = require('history')
const PropTypes = require('prop-types')
const React = require('react')
const ReactDOM = require('react-dom')
const ReactRouterDOM = require('react-router-dom')

const FusionComponents = require('@robbtraister/fusion-components')
const { App } = FusionComponents

window.History = History
window.PropTypes = PropTypes
window.React = React
window.ReactDOM = ReactDOM
window.ReactRouterDOM = ReactRouterDOM
window.FusionComponents = FusionComponents

const Fusion = (window.Fusion = window.Fusion || {})

function getComponent ({ collection, type }) {
  try {
    return collection ? Fusion.components[collection][type] : type
  } catch (_) {
    return React.Fragment
  }
}

function render () {
  const targetElement = document.getElementById('fusion-app')
  if (targetElement) {
    const serverHTML = targetElement.innerHTML
    try {
      ReactDOM[Fusion.method || 'render'](
        React.createElement(
          App,
          {
            getComponent,
            tree: Fusion.tree
          }
        ),
        targetElement
      )
    } catch (_) {
      targetElement.innerHTML = serverHTML
    }
  }
}

window.addEventListener('DOMContentLoaded', render)

export default render

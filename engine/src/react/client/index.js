'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

const React = require('react')

// support fragments in preact
React.Fragment = React.Fragment || 'div'
const ReactDOM = require('react-dom')

const Provider = require('./provider')

let did404 = false
const notFound = window.notFound = () => {
  if (!did404) {
    const noscript = window.document.getElementById('404')
    if (noscript) {
      did404 = true
      const html = noscript.innerText
      const parent = noscript.parentElement
      parent.removeChild(noscript)
      parent.innerHTML += html
    }
  }
}

let didRender = false
const render = () => {
  if (!didRender) {
    didRender = true

    if (typeof Fusion.Template === 'undefined') {
      console.error('404')
      notFound()
    } else {
      if (Fusion.Template.cssFile) {
        const templateStyle = window.document.getElementById('template-style')
        if (templateStyle) {
          templateStyle.href = `${Fusion.contextPath || ''}/dist/${Fusion.Template.cssFile}`
        }
      }

      const method = 'render' // Fusion.isFresh ? 'hydrate' : 'render'
      ReactDOM[method](
        React.createElement(
          Provider,
          {},
          React.createElement(
            Fusion.Template,
            Fusion.globalContent || {}
          )
        ),
        window.document.getElementById('App')
      )
    }
  }
}

window.document.addEventListener('DOMContentLoaded', render)
// window.document.body.onload = render

module.exports = React

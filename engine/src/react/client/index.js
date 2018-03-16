'use strict'

/* global contentCache, Template */

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

    if (typeof Template === 'undefined') {
      console.error('404')
      notFound()
    } else {
      const templateStyle = window.document.getElementById('template-style')
      if (Template.cssFile) {
        templateStyle.href = `/_assets/templates/${Template.cssFile}`
      }

      ReactDOM.hydrate(
        React.createElement(
          Provider,
          {
            contentCache,
            requestUri: window.location.pathname + window.location.search
          },
          React.createElement(
            Template
          // globalContent
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

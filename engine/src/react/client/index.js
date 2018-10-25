'use strict'

/* global Fusion */

require('./shared')

const Provider = require('./provider')

const React = window.react
const ReactDOM = window.ReactDOM

let did404 = false
const notFound = window.notFound = function () {
  if (!did404) {
    const noscript = window.document.getElementById('404')
    if (noscript) {
      did404 = true
      const html = noscript.innerHTML
      const parent = noscript.parentElement
      parent.removeChild(noscript)
      parent.innerHTML += html
    }
  }
}

let didRender = false
const render = function () {
  if (!didRender) {
    didRender = true

    if (typeof Fusion.Template === 'undefined') {
      console.error('404')
      notFound()
    } else {
      if (Fusion.Template.cssFile) {
        const templateStyle = window.document.getElementById('fusion-template-styles')
        if (templateStyle) {
          templateStyle.href = `${Fusion.contextPath || ''}/dist/${Fusion.Template.cssFile}`
        }
      }

      Fusion.Template.displayName = 'FusionTemplate'

      Fusion.elementCache = {}
      const staticElements = window.document.getElementsByClassName('fusion:static')
      Array.prototype.slice.call(staticElements).forEach(elem => {
        Fusion.elementCache[elem.id] = elem.innerHTML
      })

      const method = 'render' // Fusion.isFresh ? 'hydrate' : 'render'

      const fusionElement = window.document.getElementById('fusion-app')
      const serverHtml = fusionElement.innerHTML
      try {
        ReactDOM[method](
          React.createElement(
            Provider,
            {
              layout: Fusion.Template.layout,
              template: Fusion.Template.id
            },
            React.createElement(
              Fusion.Template,
              Fusion.globalContent || {}
            )
          ),
          fusionElement
        )
      } catch (e) {
        fusionElement.innerHTML = serverHtml
      }
    }
  }
}

window.document.addEventListener('DOMContentLoaded', render)
// window.document.body.onload = render

'use strict'

/* global Fusion, React, ReactDOM */

require('./shared')

const getContext = require('./context')
const deployment = require('./deployment')

const Quarantine = require('../components/quarantine')
const ClientLoader = require('../loaders/client-loader')

Fusion.components.Quarantine = Quarantine()

let did404 = false
function notFound () {
  if (did404) {
    return
  }

  const noscript = window.document.getElementById('404')
  if (noscript) {
    did404 = true
    const html = noscript.innerHTML
    const parent = noscript.parentElement
    parent.removeChild(noscript)
    parent.innerHTML += html
  }
}

let didRender = false
function render () {
  if (didRender) {
    return
  }
  didRender = true

  if (!Fusion.tree) {
    console.error('404')
    return notFound()
  }

  if (Fusion.tree.cssFile) {
    const templateStyle = window.document.getElementById('fusion-template-styles')
    if (templateStyle && Fusion.tree.cssHash) {
      templateStyle.href = deployment(`${Fusion.contextPath || ''}/dist/styles/${Fusion.tree.cssHash}.css`)
    }
  }

  const fusionElement = window.document.getElementById('fusion-app')
  const serverHtml = fusionElement.innerHTML

  if (fusionElement) {
    Fusion.elementCache = {}
    const staticElements = window.document.getElementsByClassName('fusion:static')
    Array.prototype.slice.call(staticElements).forEach(elem => {
      Fusion.elementCache[elem.id] = elem.innerHTML
    })

    try {
      const context = getContext(Fusion.tree)

      ReactDOM.render(
        React.createElement(
          Fusion.context.Provider,
          {
            value: context
          },
          new ClientLoader().createElement(context.props.tree)
        ),
        fusionElement
      )
    } catch (err) {
      console.error(err)
      fusionElement.innerHTML = serverHtml
    }
  }
}

window.document.addEventListener('DOMContentLoaded', render)
// window.document.body.onload = render

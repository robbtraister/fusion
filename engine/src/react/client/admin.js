'use strict'

/* global Fusion */

require('./shared')
Fusion.isAdmin = true

const Provider = require('./provider')

const version = undefined // require('./version')()

const React = window.react
const ReactDOM = window.ReactDOM

// support fragments in preact
React.Fragment = React.Fragment || 'div'

document.body.parentElement.setAttribute('xmlns:fusion', 'http://www.arcpublishing.com/fusion')
const appendBoundary = (element, id) => {
  const boundaryProps = {
    'data-fusion-component': id,
    style: { display: 'none' }
  }
  return React.createElement(
    React.Fragment,
    {},
    [
      React.createElement(
        'fusion:enter',
        Object.assign(
          { id: `fusion-enter-${id}` },
          boundaryProps
        )
      ),
      element,
      React.createElement(
        'fusion:exit',
        Object.assign(
          { id: `fusion-exit-${id}` },
          boundaryProps
        )
      )
    ]
  )
}

const ComponentCompiler = require('../shared/compile/component')
class AdminCompiler extends ComponentCompiler {
  loadComponent (componentCollection, componentType) {
    try {
      return Fusion.components[componentCollection][componentType]
    } catch (e) {}
    return null
  }

  getComponent (defaultComponent = 'div') {
    const _getComponent = super.getComponent(defaultComponent)

    return (node) => {
      return (node.collection === 'chains')
        ? appendBoundary(_getComponent(node), node.props.id)
        : _getComponent(node)
    }
  }

  getFeature (node) {
    return appendBoundary(super.getFeature(node), node.props.id)
  }
}

function CSR (rendering) {
  try {
    ReactDOM.render(
      React.createElement(
        Provider,
        {
          isAdmin: true,
          layout: rendering.layout
        },
        React.createElement(
          new AdminCompiler(rendering, Fusion.outputType).compile(),
          Fusion.globalContent || {}
        )
      ),
      window.document.getElementById('fusion-app')
    )
  } catch (e) {
    console.error(e)
  }
}

function SSR (rendering, outputType) {
  window.renderingObject.value = JSON.stringify(rendering)
  window.renderingUpdateForm.action = `/pb/api/v3/render/?outputType=${outputType}`
  window.renderingUpdateForm.submit()
}

function appendSSRForm () {
  var form = document.createElement('form')
  form.id = 'renderingUpdateForm'
  form.method = 'POST'
  form.action = '/pb/api/v3/render/'
  form.style.visibility = 'hidden'

  var rendering = document.createElement('input')
  rendering.type = 'hidden'
  rendering.name = 'rendering'
  rendering.id = 'renderingObject'

  form.appendChild(rendering)
  document.body.appendChild(form)
}

function addElement (tag, type, attr, rel) {
  return function (url) {
    var e = document.createElement(tag)
    e.type = type
    e.rel = rel
    e[attr] = url
    document.body.appendChild(e)
  }
}

const addJs = addElement('script', 'application/javascript', 'src')
const addCss = addElement('link', 'text/css', 'href', 'stylesheet')

if (Fusion.outputType) {
  addJs(`${Fusion.contextPath}/dist/components/combinations/${Fusion.outputType}.js${version ? `?v=${version}` : ''}`)
  addCss(`${Fusion.contextPath}/dist/components/output-types/${Fusion.outputType}.css${version ? `?v=${version}` : ''}`)
  addCss(`${Fusion.contextPath}/dist/components/combinations/${Fusion.outputType}.css${version ? `?v=${version}` : ''}`)
}

appendSSRForm()

window.CSR = CSR
window.SSR = SSR

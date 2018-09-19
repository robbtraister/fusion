'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

Fusion.components = Fusion.components || {}
Fusion.components.Consumer = require('../shared/components/consumer')
Fusion.components.Layout = require('../shared/components/layout')
Fusion.components.Static = require('../shared/components/static')
Fusion.unpack = require('../../utils/unpack')
Fusion.properties = require('fusion:properties')
Fusion.isAdmin = true

const Provider = require('./provider')

const version = undefined // require('./version')

const React = window.react = require('react')
const ReactDOM = window.ReactDOM = require('react-dom')
window.PropTypes = require('../shared/prop-types')

// support fragments in preact
React.Fragment = React.Fragment || 'div'

const ComponentCompiler = require('../shared/compile/component')
class AdminCompiler extends ComponentCompiler {
  loadComponent (componentCollection, componentType) {
    return Fusion.components[componentCollection][componentType]
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
    e.onload = function () {
      console.log(url + ' loaded')
    }
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

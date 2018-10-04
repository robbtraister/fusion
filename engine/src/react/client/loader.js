'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

const URL = /^(([a-z]+):\/\/)?([^/?#]+)?([^?#]*)([^#]*)(.*)/

const loaderScript = document.getElementById('fusion-loader-script')

const version = (loaderScript)
  ? require('./version')(loaderScript.src)
  : null

if (!Fusion.contextPath) {
  if (loaderScript) {
    const parts = URL.exec(loaderScript.src)
    Fusion.contextPath = parts && parts[4].replace(/\/dist\/engine\/loader\.js$/, '')
  }
}

const target = (loaderScript)
  ? loaderScript.parentElement
  : document.head

const boundaryElement = (loaderScript && loaderScript.nextSibling)

const method = (boundaryElement)
  ? 'insertBefore'
  : 'appendChild'

function loadScript (src) {
  var e = document.createElement('script')
  e.type = 'application/javascript'
  e.src = src
  e.defer = 'defer'

  target[method](e, boundaryElement)
}

if (
  !(window.Object && window.Object.assign) ||
  !window.Promise ||
  !window.fetch
) {
  loadScript(`${Fusion.contextPath}/dist/engine/polyfill.js${version ? `?v=${version}` : ''}`)
}
loadScript(`${Fusion.contextPath}/dist/engine/react.js${version ? `?v=${version}` : ''}`)

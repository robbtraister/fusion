'use strict'

/* global Fusion */

window.Fusion = window.Fusion || {}

const loaderScript = document.getElementById('fusion-loader-script')

const version = (loaderScript)
  ? require('./version')(loaderScript.src)
  : null

if (!Fusion.contextPath) {
  if (loaderScript) {
    const parts = /^(([a-z]+):\/\/)?([^/?#]+)?([^?#]*)([^#]*)(.*)/.exec(loaderScript.src)
    Fusion.contextPath = parts && parts[4].replace(/\/dist\/engine\/loader\.js$/, '')
  }
}

// TODO: make this suck less
// unfortunately, appendChild+defer handling is not as consistent as I would hope among browsers
function loadScript (src) {
  document.write(`<script type="application/javascript" src="${src}" defer=""></script>`)
}

if (
  !Array.prototype.includes ||
  !(window.Object && window.Object.assign) ||
  !window.Promise ||
  !window.fetch
) {
  loadScript(`${Fusion.contextPath}/dist/engine/polyfill.js${version ? `?v=${version}` : ''}`)
}
loadScript(`${Fusion.contextPath}/dist/engine/react.js${version ? `?v=${version}` : ''}`)

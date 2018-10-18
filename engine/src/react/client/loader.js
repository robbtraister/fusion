'use strict'

/* global __CONTEXT_PATH__ */

const loaderScript = document.getElementById('fusion-loader-script')

const deployment = (loaderScript)
  ? require('./deployment')(loaderScript.src)
  : null
const deploymentParam = deployment ? `?v=${deployment}` : ''

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
  loadScript(`${__CONTEXT_PATH__}/dist/engine/polyfill.js${deploymentParam}`)
}
loadScript(`${__CONTEXT_PATH__}/dist/engine/react.js${deploymentParam}`)

'use strict'

/* global __CONTEXT_PATH__ */

const loaderScript = document.getElementById('fusion-loader-script')

const version = (loaderScript)
  ? require('./version')(loaderScript.src)
  : null
const versionParam = version ? `?v=${version}` : ''

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
  loadScript(`${__CONTEXT_PATH__}/dist/engine/polyfill.js${versionParam}`)
}
loadScript(`${__CONTEXT_PATH__}/dist/engine/react.js${versionParam}`)

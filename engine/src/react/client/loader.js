'use strict'

/* global Fusion, __CONTEXT_PATH__ */

window.Fusion = window.Fusion || {}
Fusion.contextPath = __CONTEXT_PATH__

const loaderScript = document.getElementById('fusion-loader-script')

const version = (loaderScript)
  ? require('./version')(loaderScript.src)
  : null

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

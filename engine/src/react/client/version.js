'use strict'

function version (uri) {
  const vMatch = /(\?|&)v=([^&]*)/.exec(uri || window.location.search)
  return vMatch ? decodeURIComponent(vMatch[2]) : ''
}

version.toString = () => version()

module.exports = version

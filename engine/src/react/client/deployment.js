'use strict'

function deployment (uri) {
  const vMatch = /(\?|&)v=([^&]*)/.exec(uri || window.location.search)
  return vMatch ? decodeURIComponent(vMatch[2]) : ''
}

deployment.toString = () => deployment()

module.exports = deployment

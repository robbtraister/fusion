'use strict'

function deployment (uri) {
  const dMatch = /(\?|&)d=([^&]*)/.exec(uri || window.location.search)
  return dMatch ? decodeURIComponent(dMatch[2]) : ''
}

deployment.toString = () => deployment()

module.exports = deployment

'use strict'

function getDeployment (uri) {
  const match = /(\?|&)[dv]=([^&]*)/.exec(uri || window.location.search)
  return match ? decodeURIComponent(match[2]) : ''
}

getDeployment.toString = () => getDeployment()

module.exports = getDeployment

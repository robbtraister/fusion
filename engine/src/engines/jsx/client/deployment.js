'use strict'

/* global Fusion */

function appendDeployment (href) {
  const hrefParts = (href || '').split('#')
  const uri = hrefParts[0]
  const hash = hrefParts.slice(1).join('#')
  const uriParts = uri.split('?')
  const endpoint = uriParts[0]
  const query = uriParts.slice(1).join('?')
  const queryList = [`d=${encodeURIComponent(Fusion.deployment)}`]
    .concat(
      query.split('&').filter(q => q && !/^[dv]=/.test(q))
    )
  return `${endpoint}?${queryList.join('&')}${hash ? `#${hash}` : ''}`
}
appendDeployment.toString = () => Fusion.deployment
appendDeployment.value = Fusion.deployment
appendDeployment.valueOf = () => Fusion.deployment

module.exports = appendDeployment

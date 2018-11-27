'use strict'

const url = require('url')

module.exports = (value) => {
  const deployment = (uri) => {
    const urlParts = url.parse(uri, true)
    delete urlParts.search
    urlParts.query.d = deployment.value
    return url.format(urlParts)
  }

  deployment.test = (uri) => {
    const urlParts = url.parse(uri, true)
    /* eslint-disable eqeqeq */
    return (urlParts.query.d == value)
    /* eslint-enable eqeqeq */
  }

  deployment.toString = () => value
  deployment.value = value
  deployment.valueOf = () => value

  return deployment
}

'use strict'

const resolve = function resolve (key) {
  const requestUri = `/content/v3/stories/?canonical_url=${key}`

  return (key.hasOwnProperty('published'))
    ? `${requestUri}&published=${key.published}`
    : requestUri
}

module.exports = {
  resolve,
  schemaName: 'minimal'
}

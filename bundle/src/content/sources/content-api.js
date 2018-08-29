'use strict'

const resolve = function resolve (key) {
  const requestUri = `/content/v3/stories/?canonical_url=${key.canonical_url || key.uri}`

  return (key.hasOwnProperty('published'))
    ? `${requestUri}&published=${key.published}`
    : requestUri
}

module.exports = {
  resolve,
  schemaName: 'minimal',
  params: {
    canonical_url: 'text',
    published: 'text'
  }
}

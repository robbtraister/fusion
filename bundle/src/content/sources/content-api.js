'use strict'

const resolve = function resolve (query) {
  const requestUri = `/content/v3/stories/?canonical_url=${query.canonical_url || query.uri}`

  return (query.hasOwnProperty('published'))
    ? `${requestUri}&published=${query.published}`
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

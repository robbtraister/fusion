#!/usr/bin/env node

'use strict'

const uri = function uri (key) {
  const requestUri = `/content/v3/stories/?canonical_url=${key.uri}`

  return ('published' in key)
    ? `${requestUri}&published=${key.published}`
    : requestUri
}

module.exports = {
  uri
}

if (module === require.main) {
  console.log(uri(process.argv[2]))
}

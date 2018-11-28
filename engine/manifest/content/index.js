#!/usr/bin/env node

'use strict'

const getCollectionManifest = require('./get-collection')

function getContentManifest () {
  return {
    content: {
      ...getCollectionManifest('schemas'),
      ...getCollectionManifest('sources')
    }
  }
}

module.exports = getContentManifest

if (module === require.main) {
  console.log(JSON.stringify(getContentManifest(), null, 2))
}

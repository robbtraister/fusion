#!/usr/bin/env node

'use strict'

const collectionManifestGetter = require('./get-collection')

function getContentManifest (env) {
  const getCollectionManifest = collectionManifestGetter(env)

  return {
    content: {
      ...getCollectionManifest('schemas'),
      ...getCollectionManifest('sources')
    }
  }
}

module.exports = getContentManifest

if (module === require.main) {
  console.log(JSON.stringify(getContentManifest(require('../../environment')), null, 2))
}

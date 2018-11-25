#!/usr/bin/env node

'use strict'

const collectionFactory = require('./get-collection')
const getOutputTypes = require('./get-output-types')

function getComponentManifest (env) {
  require('./mocks')
  require('../babel/register')(env)

  const { outputTypes } = getOutputTypes(env)

  const getCollection = collectionFactory(env)(outputTypes)

  return {
    components: {
      ...getCollection('chains'),
      ...getCollection('features'),
      ...getCollection('layouts'),
      outputTypes
    }
  }
}

module.exports = getComponentManifest

if (module === require.main) {
  console.log(JSON.stringify(getComponentManifest(require('../../environment')), null, 2))
}

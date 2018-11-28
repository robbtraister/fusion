#!/usr/bin/env node

'use strict'

const collectionFactory = require('./get-collection')
const getOutputTypes = require('./get-output-types')

const env = require('../../environment')

require('./mocks')
require('../babel/register')(env)

function getComponentManifest () {
  const { outputTypes } = getOutputTypes()

  const getCollection = collectionFactory(outputTypes)

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
  console.log(JSON.stringify(getComponentManifest(), null, 2))
}

#!/usr/bin/env node

'use strict'

const getOutputTypes = require('./get-output-types')

function getComponentManifest (env) {
  require('./mocks')
  require('../babel/register')(env)

  const { outputTypes } = getOutputTypes(env)

  return {
    components: {
      ...outputTypes
    }
  }
}

module.exports = getComponentManifest

if (module === require.main) {
  console.log(JSON.stringify(getComponentManifest(require('../../environment')), null, 2))
}

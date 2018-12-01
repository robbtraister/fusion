#!/usr/bin/env node

'use strict'

// execute this as a separate process because it uses inline babel
if (module === require.main) {
  const collectionFactory = require('./get-collection')
  const getOutputTypes = require('./get-output-types')

  require('./mocks')
  require('../babel/register')

  const { outputTypes } = getOutputTypes()

  const getCollection = collectionFactory(outputTypes)

  const manifest = {
    components: {
      ...getCollection('chains'),
      ...getCollection('features'),
      ...getCollection('layouts'),
      outputTypes
    }
  }

  console.log(JSON.stringify(manifest, null, 2))
} else {
  const childProcess = require('child_process')

  module.exports = () =>
    JSON.parse(
      childProcess.execSync(`node ${require.resolve(__filename)}`)
        .toString()
    )
}

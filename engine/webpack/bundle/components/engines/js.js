'use strict'

const getEntries = require('../utils/entries')

const { buildRoot, bundleRoot } = require('../../../../environment')

const entry = Object.assign(
  {},
  ...Object.values(getEntries({ bundleRoot, ext: '.{js,ts}' }))
)

module.exports = [
  {
    ...require('../../../_shared'),
    entry,
    module: {
      rules: [
        require('../../../_shared/rules/js')
      ]
    },
    output: {
      filename: '[name]',
      path: buildRoot,
      libraryTarget: 'commonjs2'
    },
    target: 'node'
  }
]

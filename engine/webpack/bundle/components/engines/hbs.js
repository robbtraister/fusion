'use strict'

const getEntries = require('../utils/entries')

const { buildRoot, bundleRoot } = require('../../../../environment')

const entry = Object.assign(
  {},
  ...Object.values(getEntries({ bundleRoot, ext: '.hbs' }))
)

module.exports = [
  {
    ...require('../../../_shared'),
    entry,
    externals: {
      handlebars: 'handlebars',
      'handlebars/runtime': 'handlebars/runtime'
    },
    module: {
      rules: [
        require('../../../_shared/rules/hbs')
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

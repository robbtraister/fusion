'use strict'

const getEntries = require('./_shared/get-entries')('js')

const { buildRoot } = require('../../../../environment')

module.exports = (manifest) => {
  const collections = getEntries(manifest)

  return [
    {
      ...require('../../../_shared'),
      entry: Object.assign(
        {},
        ...Object.values(collections)
      ),
      module: {
        rules: [
          require('../../../_shared/rules/js')
        ]
      },
      output: {
        filename: '[name].js',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      target: 'node'
    }
  ]
}

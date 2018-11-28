'use strict'

const getEntries = require('./_shared/get-entries')('hbs')

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
        filename: '[name].hbs',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      target: 'node'
    }
  ]
}

'use strict'

const getEntries = require('../utils/entries')

module.exports = (env) => {
  const { buildRoot, bundleRoot } = env

  const entry = Object.assign(
    {},
    ...Object.values(getEntries({ bundleRoot, ext: '.hbs' }))
  )

  return [
    {
      ...require('../../../_shared/mode')(env),
      ...require('../../../_shared/optimization')(env),
      ...require('../../../_shared/resolve')(env),
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
}

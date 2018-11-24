'use strict'

const getEntries = require('../utils/entries')

module.exports = (env) => {
  const { buildRoot, bundleRoot } = env

  const entry = Object.assign(
    {},
    ...Object.values(getEntries({ bundleRoot, ext: '.js' }))
  )

  return [
    {
      ...require('../../../_shared/mode')(env),
      ...require('../../../_shared/optimization')(env),
      ...require('../../../_shared/resolve')(env),
      entry,
      module: {
        rules: [
          require('../../../_shared/rules/js')(env)
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

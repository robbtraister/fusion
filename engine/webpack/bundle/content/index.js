'use strict'

const path = require('path')

const glob = require('glob')

module.exports = (env) => {
  const { buildRoot, bundleRoot } = env

  const entry = Object.assign(
    {},
    ...glob.sync(`${bundleRoot}/content/{schemas,sources}/*.js`)
      .map((filePath) => ({
        [path.relative(bundleRoot, filePath)]: filePath
      }))
  )

  return [
    {
      ...require('../../_shared')(env),
      entry,
      externals: {
        'fusion:environment': 'fusion:environment',
        'fusion:properties': 'fusion:properties'
      },
      module: {
        rules: [
          require('../../_shared/rules/js')(env)
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

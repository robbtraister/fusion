'use strict'

const path = require('path')

const glob = require('glob')

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (env) => {
  const { buildRoot, bundleRoot } = env

  const entry = Object.assign(
    {},
    ...glob.sync(`${bundleRoot}/content/{schemas,sources}/*.{js,ts}`)
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
      plugins: [
        new CopyWebpackPlugin([{
          from: `${bundleRoot}/*.json`,
          to: `${buildRoot}/[name].[ext]`
        }])
      ],
      target: 'node'
    }
  ]
}

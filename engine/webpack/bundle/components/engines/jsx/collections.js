'use strict'

const path = require('path')

const OnBuildWebpackPlugin = require('on-build-webpack')

const getEntries = require('../_shared/get-entries')('jsx')

const {
  exec
} = require('../../../../../src/utils/promises')

const { buildRoot, distRoot } = require('../../../../../environment')

module.exports = (manifest) => {
  const { outputTypes, ...collections } = getEntries(manifest)

  return {
    ...require('../../../../_shared'),
    ...require('./externals'),
    entry: Object.assign(
      {},
      ...Object.values(collections)
    ),
    module: {
      rules: [
        require('../../../../_shared/rules/jsx'),
        {
          test: /\.s?[ac]ss$/,
          use: [
            {
              loader: 'ignore-loader'
            }
          ]
        }
      ]
    },
    output: {
      filename: '[name].jsx',
      path: buildRoot,
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new OnBuildWebpackPlugin(async function (stats) {
        // wipe cached compilations since component code has changed
        exec(`rm -rf ${path.resolve(distRoot, 'page')}`)
        exec(`rm -rf ${path.resolve(distRoot, 'styles')}`)
        exec(`rm -rf ${path.resolve(distRoot, 'template')}`)
      })
    ],
    target: 'node'
  }
}

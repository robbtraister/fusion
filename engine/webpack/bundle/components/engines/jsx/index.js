'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const getEntries = require('../../utils/entries')

const {
  exec
} = require('../../../../../src/utils/promises')

module.exports = (env) => {
  const { buildRoot, bundleRoot, distRoot } = env

  const entries = getEntries({ bundleRoot, ext: '.jsx' })
  const { outputTypes } = entries

  const entry = Object.assign(
    {},
    ...Object.values(entries)
  )

  const cssEntry = Object.assign(
    {},
    ...Object.keys(outputTypes)
      .map((relativePath) => {
        const relativeParts = path.parse(relativePath)
        return { [path.join(relativeParts.dir, relativeParts.name)]: outputTypes[relativePath] }
      })
  )

  return [
    {
      ...require('../../../../_shared')(env),
      ...require('./externals')(env),
      entry,
      module: {
        rules: [
          require('../../../../_shared/rules/jsx')(env),
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
        filename: '[name]',
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
    },
    {
      ...require('../../../../_shared')(env),
      ...require('./externals')(env),
      entry: cssEntry,
      module: {
        rules: [
          require('../../../../_shared/rules/jsx')(env),
          require('../../../../_shared/rules/css')(env),
          require('../../../../_shared/rules/sass')(env)
        ]
      },
      output: {
        filename: 'junk/[name].no-css.js',
        path: distRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        }),
        new OnBuildWebpackPlugin(function (stats) {
          // we don't actually need this js, so delete it
          exec(`rm -rf ${path.resolve(distRoot, 'junk')}`)
        })
      ],
      target: 'node'
    }
  ]
}

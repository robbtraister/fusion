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

  const entries = getEntries({ bundleRoot, ext: '.{jsx,tsx}' })
  const { outputTypes, ...componentEntries } = entries

  const componentEntry = Object.assign(
    {},
    ...Object.values(componentEntries)
  )

  const outputTypeEntry = Object.assign(
    {},
    ...Object.keys(outputTypes)
      .map((relativePath) => {
        const relativeParts = path.parse(relativePath)
        return { [path.join(relativeParts.dir, relativeParts.name)]: outputTypes[relativePath] }
      })
  )

  return [].concat(
    require('./combinations')(env),
    {
      ...require('../../../../_shared')(env),
      ...require('./externals')(env),
      entry: componentEntry,
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
      entry: outputTypeEntry,
      module: {
        rules: [
          require('../../../../_shared/rules/jsx')(env),
          require('../../../../_shared/rules/css')(env),
          require('../../../../_shared/rules/sass')(env)
        ]
      },
      output: {
        filename: '[name].jsx',
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        })
      ],
      target: 'node'
    }
  )
}

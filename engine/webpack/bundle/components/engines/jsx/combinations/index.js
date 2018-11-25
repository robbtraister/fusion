'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env) => {
  const { distRoot, generatedRoot } = env

  return function getCombinationConfigs (componentManifest) {
    const { outputTypes } = componentManifest

    const entry = Object.assign(
      {},
      ...Object.values(outputTypes)
        .map((outputTypeManifest) => {
          const { name, outputType } = outputTypeManifest
          return {
            [name]: path.resolve(generatedRoot, 'combinations', outputType)
          }
        })
    )

    return Object.keys(entry).length
      ? {
        ...require('../../../../../_shared')(env),
        ...require('../externals')(env),
        entry,
        module: {
          rules: [
            require('../../../../../_shared/rules/jsx')(env),
            require('../../../../../_shared/rules/css')(env),
            require('../../../../../_shared/rules/sass')(env)
          ]
        },
        output: {
          filename: `[name].js`,
          path: path.resolve(distRoot, 'components', 'combinations')
        },
        plugins: [
          new MiniCssExtractPlugin({
            filename: '[name].css'
          })
        ],
        target: 'web'
      }
      : null
  }
}

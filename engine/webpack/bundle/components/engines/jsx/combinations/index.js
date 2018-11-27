'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { distRoot, generatedRoot } = require('../../../../../../environment')

module.exports = function getCombinationConfigs (componentManifest) {
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
      ...require('../../../../../_shared'),
      ...require('../externals'),
      entry,
      module: {
        rules: [
          require('../../../../../_shared/rules/jsx'),
          require('../../../../../_shared/rules/css'),
          require('../../../../../_shared/rules/sass')
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

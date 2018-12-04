'use strict'

const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { distRoot, generatedRoot } = require('../../../../../../environment')

module.exports = function getCombinationConfigs (manifest) {
  const { outputTypes } = manifest

  const entry = Object.assign(
    {},
    ...Object.values(outputTypes)
      .filter(({ engine }) => engine === 'jsx')
      .map((outputTypeManifest) => {
        const { base, type } = outputTypeManifest
        return {
          [type]: path.resolve(generatedRoot, 'combinations', `${base}`)
        }
      })
  )

  return Object.keys(entry).length
    ? {
      ...require('../../../../../_shared'),
      entry,
      externals: {
        '@arc-fusion/prop-types': 'PropTypes',
        'fusion:consumer': 'Fusion.components.Consumer',
        'fusion:content': 'Fusion.components.Content',
        'fusion:context': 'Fusion.components.Context',
        'fusion:environment': '{}',
        'fusion:properties': 'Fusion.getProperties',
        'fusion:prop-types': 'PropTypes',
        'prop-types': 'PropTypes',
        react: 'react',
        'react-dom': 'ReactDOM'
      },
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

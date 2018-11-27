'use strict'

const path = require('path')

const DefinePlugin = require('webpack').DefinePlugin

const { distRoot, engineSrcRoot, generatedRoot } = require('../../environment')

const propertiesFile = path.resolve(generatedRoot, 'properties.js')

module.exports = [
  {
    ...require('../_shared'),
    entry: {
      admin: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client', 'admin')),
      polyfill: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client', 'polyfill')),
      preview: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client', 'preview')),
      react: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client'))
    },
    module: {
      rules: [
        require('../_shared/rules/js')
      ]
    },
    output: {
      filename: '[name].js',
      path: path.resolve(distRoot, 'engine')
    },
    plugins: [
      new DefinePlugin({
        __FUSION_PROPERTIES_FILE__: `'${propertiesFile}'`
      })
    ],
    target: 'web'
  }
]

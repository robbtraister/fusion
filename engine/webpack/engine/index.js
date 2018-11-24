'use strict'

const path = require('path')

const DefinePlugin = require('webpack').DefinePlugin

module.exports = (env) => {
  const { distRoot, engineSrcRoot } = env

  return [
    {
      ...require('../_shared/mode')(env),
      ...require('../_shared/optimization')(env),
      ...require('../_shared/resolve')(env),
      entry: {
        admin: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client', 'admin')),
        polyfill: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client', 'polyfill')),
        preview: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client', 'preview')),
        react: require.resolve(path.resolve(engineSrcRoot, 'engines', 'jsx', 'client'))
      },
      module: {
        rules: [
          require('../_shared/rules/js')(env)
        ]
      },
      output: {
        filename: '[name].js',
        path: path.resolve(distRoot, 'engine')
      },
      plugins: [
        new DefinePlugin({
          __FUSION_PROPERTIES_FILE__: `'${require('../bundle/properties/get-file')(env)}'`
        })
      ],
      target: 'web'
    }
  ]
}

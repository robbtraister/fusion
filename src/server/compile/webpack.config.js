'use strict'

// const { exec } = require('child_process')
const path = require('path')

// const OnBuildPlugin = require('../../../webpack/plugins/on-build-plugin')

module.exports = (root, name = 'template') => {
  return {
    ...require('../../../webpack'),
    entry: {
      [`templates/${name}`]: root
    },
    module: {
      rules: [
        {
          // test: /.*/i,
          exclude: require.resolve(root),
          use: [
            {
              loader: require.resolve('../../../webpack/loaders/ignore-loader')
            }
          ]
        }
      ]
    },
    optimization: {
      chunkIds: 'named',
      moduleIds: 'named',
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: 'all',
        minSize: 0,
        cacheGroups: {
          components: {
            test: /[\\/]bundle[\\/]components[\\/]/,
            enforce: true,
            name (mod) {
              const match = /[\\/]bundle[\\/]components[\\/]([^\\/.]+)[\\/]([^\\/.]+)([\\/]([^\\/.]+))?/.exec(mod.resource || mod.context)
              const collection = match[1]
              const type = (collection === 'features')
                ? `${match[2]}${match[3]}`
                : match[2]
              return `components/${collection}/${type}`
            }
          }
        }
      }
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: path.join(root, 'dist'),
      publicPath: '/dist/'
    },
    // plugins: [
    //   new OnBuildPlugin(() => {
    //     exec(`rm -rf '${path.join(root, 'dist', 'junk')}'`)
    //   })
    // ],
    target: 'web'
  }
}

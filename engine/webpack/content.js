'use strict'

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const babelLoader = require('./shared/loaders/babel-loader')

const externals = require('./shared/externals').node
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  schemasSrcRoot,
  schemasDistRoot,
  sourcesSrcRoot,
  sourcesDistRoot
} = require('../environment')

const {
  content
} = require('../manifest')

const getConfig = (entry, srcRoot, distRoot) => {
  return (Object.keys(entry).length)
    ? {
      entry,
      externals,
      mode,
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/i,
            exclude: /node_modules/,
            use: [
              babelLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: distRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new CopyWebpackPlugin([{
          from: `${srcRoot}/*.json`,
          to: `${distRoot}/[name].[ext]`
        }]),
        new ManifestPlugin({fileName: 'webpack.manifest.json'}),
        new OnBuildWebpackPlugin(function (stats) {
          // TODO: compute configs at compile-time (instead of on-demand) after disabling JGE option
          // fs.writeFile(`${sourcesDistRoot}/fusion.configs.json`, JSON.stringify(entry, null, 2), () => {})
        })
      ],
      resolve,
      target: 'node',
      watchOptions: {
        ignored: /node_modules/
      }
    }
    : []
}

module.exports = [].concat(
  getConfig(content.schemas, schemasSrcRoot, schemasDistRoot),
  getConfig(content.sources, sourcesSrcRoot, sourcesDistRoot)
)

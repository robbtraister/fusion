'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const babelLoader = require('./shared/loaders/babel-loader')

const externals = require('./shared/externals').node
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

// const loadConfigs = require('../src/configs')

const {
  sourcesRoot,
  sourcesDistRoot
} = require('../environment')

const entry = Object.assign(
  {},
  ...glob.sync(`${sourcesRoot}/*.js`)
    .map((f) => {
      return {[path.parse(f).name]: f}
    })
)

module.exports = (Object.keys(entry).length)
  ? {
    entry,
    externals,
    mode,
    module: {
      rules: [
        {
          test: /\.jsx?$/i,
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
      path: sourcesDistRoot,
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new CopyWebpackPlugin([{
        from: `${sourcesRoot}/*.json`,
        to: `${sourcesDistRoot}/[name].[ext]`
      }]),
      new ManifestPlugin({fileName: 'webpack.manifest.json'}),
      new OnBuildWebpackPlugin(function (stats) {
        fs.writeFile(`${sourcesDistRoot}/fusion.manifest.json`, JSON.stringify(entry, null, 2), () => {
          // TODO: compute configs at compile-time (instead of on-demand) after disabling JGE option
          // fs.writeFile(`${sourcesDistRoot}/fusion.configs.json`, JSON.stringify(entry, null, 2), () => {})
        })
      })
    ],
    resolve,
    target: 'node',
    watchOptions: {
      ignored: /node_modules/
    }
  }
  : null

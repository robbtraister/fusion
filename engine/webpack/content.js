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

const {
  schemasDistRoot,
  schemasSrcRoot,
  sourcesDistRoot,
  sourcesSrcRoot
} = require('../environment')

const getEntry = (rootDir) => Object.assign(
  {},
  ...glob.sync(`${rootDir}/*.{js,ts}`)
    .map((filePath) => {
      return {[path.parse(filePath).name]: filePath}
    })
)

const getConfig = (srcRoot, distRoot) => {
  const entry = getEntry(srcRoot)

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
          fs.writeFile(`${distRoot}/fusion.manifest.json`, JSON.stringify(entry, null, 2), () => {
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
    : []
}

module.exports = [].concat(
  getConfig(schemasSrcRoot, schemasDistRoot),
  getConfig(sourcesSrcRoot, sourcesDistRoot)
)

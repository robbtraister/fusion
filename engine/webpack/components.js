'use strict'

const childProcess = require('child_process')
const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const components = require('./shared/components')

// console.log(components)

const {
  componentDistRoot,
  componentSrcRoot,
  distRoot,
  isDev
} = require('../environment')

const plugins = [
  new MiniCssExtractPlugin({
    filename: '[name].css'
  }),
  new ManifestPlugin({fileName: 'manifest.json'})
]

if (isDev) {
  plugins.push(
    new OnBuildWebpackPlugin(function (stats) {
      childProcess.execSync(`rm -rf '${path.resolve(distRoot, 'page')}'`)
      childProcess.execSync(`rm -rf '${path.resolve(distRoot, 'template')}'`)
    })
  )
}

module.exports = Object.keys(components).map((type) => {
  const entry = {}

  components[type]
    .forEach((fp) => {
      const name = path.relative(path.resolve(componentSrcRoot, type), fp)
      const parts = path.parse(name)
      entry[path.join(parts.dir, parts.name)] = fp
    })

  return (Object.keys(entry).length)
    ? {
      devtool: false,
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
          },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              cssLoader
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              cssLoader,
              sassLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: path.resolve(componentDistRoot, type),
        libraryTarget: 'commonjs2'
      },
      plugins,
      resolve,
      target: 'web',
      watchOptions: {
        ignored: /node_modules/
      }
    }
    : null
})

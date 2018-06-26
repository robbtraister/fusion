'use strict'

const path = require('path')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const ConcatSource = require('webpack-sources').ConcatSource
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
// const mode = require('./shared/mode')
// const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const components = require('./shared/components')

const {
  componentDistRoot,
  componentSrcRoot,
  distRoot,
  isDev
} = require('../environment')

const entry = {}
const types = {}
components
  .forEach(f => {
    const name = f.substr(componentSrcRoot.length + 1)
    const type = name.split('/').shift()
    types[type] = true
    const parts = path.parse(name)
    entry[path.join(parts.dir, parts.name)] = f
  })

const plugins = [
  // each entry is watched independently, so we can't reliably clean all components
  // new CleanWebpackPlugin(
  //   glob.sync(`${componentSrcRoot}/!(output-types)/`).map(f => path.basename(f)),
  //   {
  //     root: componentDistRoot,
  //     watch: true
  //   }
  // ),
  new MiniCssExtractPlugin({
    filename: '[name].css'
  }),
  new ManifestPlugin({fileName: 'components.json'})
]

if (isDev) {
  plugins.push(
    // only a single entry, so these can be cleaned reliably
    new CleanWebpackPlugin(
      [
        'page',
        'template'
      ],
      {
        root: distRoot,
        watch: true
      }
    )
  )
}

module.exports = (Object.keys(entry).length)
  ? Object.keys(entry).map(key => {
    return {
      entry: {[key]: entry[key]},
      externals,
      mode: 'production',
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
      optimization: {
        minimizer: [new UglifyWebpackPlugin({
          parallel: true,
          test: /\.jsx?$/i
        })]
      },
      output: {
        filename: `[name].js`,
        path: componentDistRoot,
        libraryExport: 'default',
        libraryTarget: 'commonjs2'
      },
      plugins,
      resolve,
      target: 'web',
      watchOptions: {
        ignored: /node_modules/
      }
    }
  })
  : null

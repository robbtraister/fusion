'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentSrcRoot,
  isDev
} = require('../src/environment')

const entry = {}
const types = {}
glob.sync(`${componentSrcRoot}/!(output-types)/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => {
    const name = f.substr(componentSrcRoot.length + 1)
    const type = name.split('/').shift()
    types[type] = true
    const parts = path.parse(name)
    entry[path.join(parts.dir, parts.name)] = f
  })

fs.writeFileSync(`./combined.jsx`,
  `
const Components = {}
${Object.keys(types).map(type => `Components['${type}'] = Components['${type}'] || {}`).join('\n')}
${Object.keys(entry).map(name => {
    const f = entry[name]
    const pieces = name.split('/')
    const type = pieces.shift()
    const id = pieces.join('/')
    return `Components['${type}']['${id.replace(/\.(hbs|jsx?|vue)$/, '')}'] = require('${f}')`
  }).join('\n')}
module.exports = Components
  `
)

module.exports = {
  entry: {
    combined: './combined.jsx'
  },
  externals,
  mode,
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                'es2015',
                'react'
              ],
              plugins: [
                'transform-decorators-legacy'
              ],
              comments: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: !isDev
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: !isDev
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  optimization,
  output: {
    filename: `[name].js`,
    path: path.resolve(__dirname, '..', 'dist', 'components'),
    library: `window.Fusion=window.Fusion||{};Fusion.Components`,
    libraryTarget: 'assign'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CleanWebpackPlugin(
      [
        'page',
        'template'
      ],
      {
        root: path.resolve(__dirname, 'dist'),
        watch: true
      }
    )
  ],
  resolve
}

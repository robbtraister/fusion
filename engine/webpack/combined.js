'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentSrcRoot,
  distRoot
} = require('../environment')

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

const combinedSrcFile = path.resolve('./combined.jsx')
fs.writeFileSync(combinedSrcFile,
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
    combined: combinedSrcFile
  },
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
    path: path.resolve(distRoot, 'components'),
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
        root: distRoot,
        watch: true
      }
    )
  ],
  resolve
}

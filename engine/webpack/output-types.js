'use strict'

const path = require('path')

const glob = require('glob')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const ManifestPlugin = require('webpack-manifest-plugin')

const cssLoader = require('./shared/css-loader')
const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  componentSrcRoot
} = require('../src/environment')

const outputTypeSrcRoot = path.resolve(`${componentSrcRoot}/output-types`)

const output = {
  filename: `[name].js`,
  path: path.resolve(__dirname, '..', 'dist', 'components', 'output-types'),
  libraryTarget: 'commonjs2'
}

const entry = {}
const types = {}
glob.sync(`${outputTypeSrcRoot}/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => {
    const name = f.substr(outputTypeSrcRoot.length + 1)
    const type = name.split('/').shift()
    types[type] = true
    const parts = path.parse(name)
    entry[path.join(parts.dir, parts.name)] = f
  })

// compile twice
// first pass will extract css into a separate file suitable for references
// (e.g., /pb/dist/components/output-types/amp.css)
// second pass will embed css into output-type script for direct access
// direct access is only viable since output-types are only accessed on the server
// we wouldn't compile excess information into client scripts
module.exports = (Object.keys(entry).length)
  ? [
    {
      entry,
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
              cssLoader
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              cssLoader,
              'sass-loader'
            ]
          }
        ]
      },
      optimization,
      output: Object.assign({}, output, {
        filename: '[name].no-css.js'
      }),
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css'
        })
      ],
      resolve
    },
    {
      entry,
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
              'to-string-loader',
              cssLoader
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              'to-string-loader',
              cssLoader,
              'sass-loader'
            ]
          }
        ]
      },
      optimization,
      output,
      plugins: [
        // new ManifestPlugin()
      ],
      resolve
    }
  ]
  : null

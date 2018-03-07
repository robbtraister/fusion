'use strict'

const path = require('path')
const glob = require('glob')

const ManifestPlugin = require('webpack-manifest-plugin')

const assetsRoot = process.env.ASSETS_ROOT || `${__dirname}/assets`

const VENDOR_PACKAGES = ['react']

function externals (context, request, callback) {
  if (VENDOR_PACKAGES.includes(request)) {
    return callback(null, request)
  }
  callback()
}

// if consumer is not found, attempt to build without it
let alias = {}
try {
  alias = {
    'consumer': require.resolve('./src/components/consumer.js')
  }
} catch (e) {}

const componentDir = path.resolve(`${assetsRoot}/components`)
const entry = {}
glob.sync(`${componentDir}/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => { entry[f.substr(componentDir.length + 1)] = f })

module.exports = Object.keys(entry).length
  ? {
    entry,
    externals,
    mode: 'development',
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
        }
      ]
    },
    output: {
      filename: `[name]`,
      path: path.resolve(__dirname, 'dist', 'components'),
      libraryTarget: 'commonjs2'
    },
    plugins: [new ManifestPlugin()],
    resolve: {
      alias,
      extensions: ['.js', '.jsx']
    }
  }
  : null

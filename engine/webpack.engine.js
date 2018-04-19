'use strict'

const path = require('path')

const ManifestPlugin = require('webpack-manifest-plugin')

const mode = require('./webpack/mode')
const optimization = require('./webpack/optimization')
const rules = require('./webpack/rules')

module.exports = {
  entry: {
    react: require.resolve('./src/react/client')
  },
  mode,
  module: {
    rules
  },
  optimization,
  output: {
    filename: `[name].js`,
    path: path.resolve(__dirname, 'dist', 'engine'),
    library: 'react',
    libraryTarget: 'var'
  },
  plugins: [
    new ManifestPlugin()
  ],
  target: 'web'
}

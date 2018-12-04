'use strict'

const mockRequire = require('mock-require')
// node-sass requires native compilation, which we can't guarantee will work in lambda
// so replace it with an all-js alternative
mockRequire('node-sass', 'sass')
mockRequire('node-sass/package.json', { version: 4 })

const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')

module.exports = (options) => {
  const { entry, minify, outputDir, rootPath } = options

  const optimization = (minify)
    ? {
      minimizer: [new UglifyWebpackPlugin({
        parallel: true,
        sourceMap: true,
        test: /\.[jt]sx?$/i
      })]
    }
    : {}

  return {
    externals: {
      'fusion:consumer': 'Fusion.components.Consumer',
      'fusion:content': 'Fusion.components.Content',
      'fusion:context': 'Fusion.components.Context',
      'fusion:environment': '{}',
      'fusion:properties': 'Fusion.getProperties',
      'fusion:prop-types': 'PropTypes',
      'prop-types': 'PropTypes',
      react: 'react',
      'react-dom': 'ReactDOM'
    },
    entry,
    mode: (minify) ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          exclude: /\/node_modules\/(?!@arc-fusion\/)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [
                  '@babel/env',
                  '@babel/react'
                ],
                plugins: [
                  ['root-import', {
                    rootPathPrefix: '~',
                    rootPathSuffix: rootPath
                  }],
                  ['@babel/proposal-decorators', {
                    legacy: true
                  }],
                  ['@babel/proposal-class-properties', {
                    loose: true
                  }],
                  '@babel/proposal-object-rest-spread'
                ]
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
                minimize: minify,
                url: false
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
                minimize: minify,
                url: false
              }
            },
            'sass-loader'
          ]
        }
      ]
    },
    optimization,
    output: {
      filename: '[name]',
      path: outputDir
      // library: `window.Fusion=window.Fusion||{};window.Fusion.tree`,
      // libraryTarget: 'assign'
    },
    plugins: [
      new ManifestPlugin({ fileName: 'manifest.json' }),
      new MiniCssExtractPlugin({
        filename: '[contenthash].css'
      })
    ],
    resolve: {
      cacheWithContext: false,
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
      symlinks: false
    },
    target: 'web'
  }
}

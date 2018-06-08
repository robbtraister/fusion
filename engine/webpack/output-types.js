'use strict'

const childProcess = require('child_process')
const path = require('path')

const glob = require('glob')

// const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')
const isTest = require('./shared/is-test')

const {
  componentDistRoot,
  componentSrcRoot
} = require('../environment')

const outputTypeSrcRoot = path.resolve(`${componentSrcRoot}/output-types`)

const entry = {}
glob.sync(`${outputTypeSrcRoot}/*.{hbs,js,jsx,vue}`)
  .filter(f => !isTest(f))
  .forEach(fp => { entry[path.parse(fp).name] = fp })

// Compile twice.
// First pass will extract css into a separate file suitable for references
//  (e.g., /pb/dist/components/output-types/amp.css).
// Second pass will embed css into output-type script for direct access.
// Direct access makes sense since output-types are only accessed on the server.
// We wouldn't compile excess information into client scripts.
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
        filename: 'junk/[name].no-css.js',
        path: componentDistRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        // each entry is watched independently, so we can't reliably clean all components
        // new CleanWebpackPlugin(
        //   [
        //     'output-types/**/*.css'
        //   ],
        //   {
        //     root: componentDistRoot,
        //     watch: true
        //   }
        // ),
        new MiniCssExtractPlugin({
          filename: 'output-types/[name].css'
        }),
        // we don't actually need this js, so delete it
        new OnBuildWebpackPlugin(function (stats) {
          childProcess.execSync(`rm -rf ${path.resolve(componentDistRoot, 'junk')}`)
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
              babelLoader
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
              sassLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `output-types/[name].js`,
        path: componentDistRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        // each entry is watched independently, so we can't reliably clean all components
        // new CleanWebpackPlugin(
        //   [
        //     'output-types/**/*.js'
        //   ],
        //   {
        //     root: componentDistRoot,
        //     watch: true
        //   }
        // )
        new ManifestPlugin({fileName: 'manifest.output-types.json'})
      ],
      resolve
    }
  ]
  : null

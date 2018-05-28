'use strict'

const childProcess = require('child_process')
const path = require('path')

const glob = require('glob')

// const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')
// const PreBuildWebpackPlugin = require('pre-build-webpack')
// const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const cssLoader = require('./shared/loaders/css-loader')
const sassLoader = require('./shared/loaders/sass-loader')

const externals = require('./shared/externals')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const isTest = require('./shared/is-test')

const {
  componentSrcRoot,
  distRoot
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
        path: path.resolve(distRoot, 'components'),
        libraryTarget: 'commonjs2'
      },
      plugins: [
        // new CleanWebpackPlugin(
        //   [
        //     path.resolve(distRoot, 'components', 'output-types', '**/*.css')
        //   ],
        //   {
        //     root: distRoot,
        //     watch: true
        //   }
        // ),
        new MiniCssExtractPlugin({
          filename: 'output-types/[name].css'
        }),
        // we don't actually need this js, so delete it
        new OnBuildWebpackPlugin(function (stats) {
          childProcess.execSync(`rm -rf ${path.resolve(distRoot, 'components', 'junk')}`)
        })
      ]
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
        filename: `[name].js`,
        path: path.resolve(distRoot, 'components', 'output-types'),
        libraryTarget: 'commonjs2'
      },
      plugins: [
        // new CleanWebpackPlugin(
        //   [
        //     path.resolve(distRoot, 'components', 'output-types', '**/*.js')
        //   ],
        //   {
        //     root: distRoot,
        //     watch: true
        //   }
        // )
        // new ManifestPlugin()
      ]
    }
  ]
  : null

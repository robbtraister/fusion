'use strict'

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const OnBuildWebpackPlugin = require('on-build-webpack')

const babelLoader = require('./shared/loaders/babel-loader')

const externals = require('./shared/externals').node
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  schemasSrcRoot,
  schemasBuildRoot,
  sourcesSrcRoot,
  sourcesBuildRoot
} = require('../environment')

const {
  content
} = require('../manifest')

const {
  writeFile
} = require('../src/utils/promises')

const loadSchemasConfigs = require('../src/configs/content/schemas')
const loadSourcesConfigs = require('../src/configs/content/sources')

const getConfig = (entry, srcRoot, buildRoot, loadConfigsFn) => {
  return (Object.keys(entry).length)
    ? {
      entry,
      externals,
      mode,
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/i,
            exclude: /\/node_modules\/(?!@arc-fusion\/)/,
            use: [
              babelLoader
            ]
          }
        ]
      },
      optimization,
      output: {
        filename: `[name].js`,
        path: buildRoot,
        libraryTarget: 'commonjs2'
      },
      plugins: [
        new CopyWebpackPlugin([{
          from: `${srcRoot}/*.json`,
          to: `${buildRoot}/[name].[ext]`
        }]),
        new ManifestPlugin({ fileName: 'webpack.manifest.json' }),
        new OnBuildWebpackPlugin(function (stats) {
          loadConfigsFn()
            .then((configs) =>
              writeFile(`${buildRoot.replace(/\/build\//, '/dist/')}/fusion.configs.json`, JSON.stringify(configs, null, 2))
            )
        })
      ],
      resolve,
      target: 'node',
      watchOptions: {
        ignored: /\/node_modules\//
      }
    }
    : []
}

module.exports = [].concat(
  getConfig(content.schemas, schemasSrcRoot, schemasBuildRoot, loadSchemasConfigs),
  getConfig(content.sources, sourcesSrcRoot, sourcesBuildRoot, loadSourcesConfigs)
)

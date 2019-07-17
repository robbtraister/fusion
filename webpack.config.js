'use strict'

const crypto = require('crypto')
const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {
  distRoot,
  generatedRoot
} = require('./env')

const {
  exec,
  writeFile
} = require('./src/utils/promises')

const manifest = require('./src/manifest')()
require('./src/manifest/generate')(manifest)
const { components } = manifest

const OnBuildPlugin = require('./webpack/plugins/on-build-plugin')

function collectionEntries (collectionName) {
  const collection = components[collectionName]

  return Object.assign(
    {},
    ...Object.keys(collection)
      .map(componentName => ({ [`components/${collectionName}/${componentName}`]: collection[componentName] }))
  )
}

const componentEntry = Object.assign(
  {},
  ...Object.keys(components)
    .filter(collectionName => collectionName !== 'output-types')
    .map(collectionEntries)
)

const outputTypeEntry = collectionEntries('output-types')

function exportAssets (stats) {
  const { compilation } = stats
  const entrypoints = [...compilation.entrypoints.keys()]

  const assets = Object.assign(
    {},
    ...entrypoints.map((entrypoint) => {
      const chunks = compilation.entrypoints.get(entrypoint).chunks
      return {
        [entrypoint]: [].concat(
          ...chunks
            .filter((chunk) => chunk.id !== 'runtime')
            .map((chunk) => chunk.files)
        )
      }
    })
  )

  writeFile(
    path.join(distRoot, 'components', 'assets.json'),
    JSON.stringify({ assets }, null, 2)
  )
}

module.exports = [
  // fusion engine
  {
    ...require('./webpack'),
    entry: {
      engine: './src/fusion/client'
    },
    externals: undefined,
    module: {
      rules: require('./webpack/rules')
    },
    optimization: {
      ...require('./webpack/optimization'),
      chunkIds: 'named',
      moduleIds: 'named',
      runtimeChunk: {
        name: 'runtime'
      }
    },
    output: {
      filename: '[name].js',
      path: distRoot,
      publicPath: '/dist/'
    },
    target: 'web'
  },
  // split components
  {
    ...require('./webpack'),
    entry: componentEntry,
    module: {
      rules: [
        {
          test: /\.(s?[ac]ss$)/,
          use: {
            loader: MiniCssExtractPlugin.loader
          }
        },
        ...require('./webpack/rules')
      ]
    },
    optimization: {
      ...require('./webpack/optimization'),
      chunkIds: 'named',
      moduleIds: 'named',
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: 'all',
        minSize: 0,
        name (mod, chunks, cacheGroupKey) {
          const chunkName = [].concat(chunks)
            .map((chunk) => chunk.name)
            .sort()
            .join('~')

          const hash = crypto.createHash('md5')
            .update(chunkName)
            .digest()
            .toString('hex')

          return `components/chunks/${hash}`
        }
      }
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: distRoot,
      publicPath: '/dist/'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'styles/[name].css',
        chunkFilename: '[name].css'
      }),
      new OnBuildPlugin((stats) => {
        exec(`rm -rf '${path.join(distRoot, 'templates')}'`)
        exportAssets(stats)
      })
    ],
    target: 'web'
  },
  // combined components (for server and preview)
  {
    ...require('./webpack'),
    entry: {
      'components/combinations': path.join(generatedRoot, 'components')
    },
    externals: [
      require('./webpack/externals'),
      {
        'styled-components': require.resolve('styled-components')
      }
    ],
    module: {
      rules: [
        ...require('./webpack/rules/files'),
        {
          test: /\.s?[ac]ss$/,
          use: {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local'
              },
              onlyLocals: true,
              sourceMap: true
            }
          }
        },
        {
          test: /\.s[ac]ss$/,
          use: {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        },
        ...require('./webpack/rules/scripts')
      ]
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      globalObject: '(typeof window === \'undefined\' ? global : window)',
      libraryTarget: 'umd',
      path: distRoot,
      publicPath: '/dist/'
    },
    target: 'web'
  },
  // output-types
  {
    ...require('./webpack'),
    entry: outputTypeEntry,
    externals: [
      require('./webpack/externals'),
      {
        'styled-components': require.resolve('styled-components')
      }
    ],
    module: {
      rules: [
        {
          test: /\.(s?[ac]ss$)/,
          use: {
            loader: MiniCssExtractPlugin.loader
          }
        },
        ...require('./webpack/rules')
      ]
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      libraryTarget: 'commonjs2',
      path: distRoot
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].css'
      })
    ],
    target: 'node'
  }
]

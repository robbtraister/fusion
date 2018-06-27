'use strict'

const path = require('path')

// const CleanWebpackPlugin = require('clean-webpack-plugin')
const HandlebarsPlugin = require('handlebars-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const babelLoader = require('./shared/loaders/babel-loader')
const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const outputTypes = require('./shared/output-types')
const resolve = require('./shared/resolve')

const components = require('./shared/components')

const {
  distRoot,
  contextPath
} = require('../environment')

const {
  clientEntries: entry
} = require('../src/react')

module.exports = [
  {
    entry,
    mode,
    module: {
      rules: [
        {
          test: /\.jsx?$/i,
          exclude: /node_modules/,
          use: [
            babelLoader
          ]
        }
      ]
    },
    optimization,
    output: {
      filename: `[name].js`,
      path: path.resolve(distRoot, 'engine'),
      library: 'react',
      libraryTarget: 'var'
    },
    plugins: [
      // each entry is watched independently, so we can't reliably clean all components
      // new CleanWebpackPlugin(
      //   [
      //     'engine'
      //   ],
      //   {
      //     root: distRoot,
      //     watch: true
      //   }
      // ),
      new ManifestPlugin({fileName: 'manifest.json'}),
      ...Object.keys(outputTypes)
        .map((outputType) => {
          const scripts = []
          const styles = []

          Object.keys(components)
            .forEach((componentType) => {
              Object.keys(components[componentType])
                .forEach((componentName) => {
                  const component = components[componentType][componentName]
                  const componentOutputType = [outputType, 'default', 'index'].find(ot => (ot in component))
                  if (componentOutputType) {
                    scripts.push(`${componentType}/${componentName}/${componentOutputType}.js`)
                    styles.push(`${componentType}/${componentName}/${componentOutputType}.css`)
                  }
                })
            })

          return new HandlebarsPlugin({
            entry: require.resolve('../src/react/client/preview.html.hbs'),
            output: path.resolve(distRoot, 'engine', 'preview', `${outputType}.html`),
            data: {
              contextPath,
              scripts,
              styles
            }
          })
        })
    ],
    resolve,
    target: 'web',
    watchOptions: {
      ignored: /node_modules/
    }
  }
]

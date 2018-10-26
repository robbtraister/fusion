'use strict'

const path = require('path')

const babelLoader = require('./shared/loaders/babel-loader')

const mode = require('./shared/mode')
const optimization = require('./shared/optimization')
const resolve = require('./shared/resolve')

const {
  bundleBuildRoot,
  bundleSrcRoot
} = require('../environment')

function getEnvironmentScript () {
  try {
    const envScript = require.resolve(path.join(bundleSrcRoot, 'environment'))
    return (envScript && (path.extname(envScript).toLowerCase() === '.js'))
      ? envScript
      : null
  } catch (e) {
    return null
  }
}

const envScript = getEnvironmentScript()

module.exports = envScript
  ? {
    entry: {
      environment: envScript
    },
    mode,
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          exclude: /\/node_modules\//,
          use: [
            babelLoader
          ]
        }
      ]
    },
    optimization,
    output: {
      filename: `[name].js`,
      path: bundleBuildRoot,
      libraryTarget: 'commonjs2'
    },
    resolve,
    target: 'node',
    watchOptions: {
      ignored: /\/node_modules\//
    }
  }
  : []

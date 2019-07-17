'use strict'

const path = require('path')

const cwd = path.resolve('.')
const fusionRoot = path.dirname(__dirname)
const bundleRoot = path.resolve(
  process.env.BUNDLE_ROOT ||
    (cwd === fusionRoot ? path.resolve(fusionRoot, 'bundle') : cwd)
)

const version = require(path.join(fusionRoot, 'package.json')).version

const buildRoot = path.join(bundleRoot, '.fusion', 'build')
const distRoot = path.join(bundleRoot, '.fusion', 'dist')
const generatedRoot = path.join(bundleRoot, '.fusion', 'generated')

require('dotenv').config({ path: path.resolve(bundleRoot, '.env') })

const defaultOutputType = process.env.DEFAULT_OUTPUT_TYPE || 'default'
const defaultPort = Number(process.env.PORT) || 8080
const fileLimit = Number(process.env.FILE_LIMIT) || 8192
const isProd = /^prod/i.test(process.env.NODE_ENV)

const isDev = !isProd

module.exports = {
  buildRoot,
  bundleRoot,
  defaultOutputType,
  defaultPort,
  distRoot,
  fileLimit,
  fusionRoot,
  generatedRoot,
  isDev,
  isProd,
  version
}

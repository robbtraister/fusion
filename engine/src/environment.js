'use strict'

const path = require('path')

const glob = require('glob')

const contentBase = process.env.CONTENT_BASE || ''
const prefix = (process.env.CONTEXT || 'pb').replace(/^\/*/, '/').replace(/\/+$/, '')
const apiPrefix = `${prefix}/api/v3`
const daoUrl = process.env.DAO_URL
const environment = process.env.ENVIRONMENT
const isDev = !/^prod/i.test(process.env.NODE_ENV)
const minify = (isDev) ? process.env.MINIFY === 'true' : true
const mongoUrl = process.env.MONGO_URL
const onDemand = process.env.ON_DEMAND === 'true'
const port = process.env.PORT || 8080
const version = process.env.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST'

const bundleRoot = path.resolve(process.env.BUNDLE_ROOT || `${__dirname}/../bundle`)
const distRoot = path.resolve(`${bundleRoot}/../dist`)
const componentDistRoot = path.resolve(`${distRoot}/components`)
const componentSrcRoot = path.resolve(`${bundleRoot}/components`)
const schemasRoot = path.resolve(process.env.SCHEMAS_ROOT || `${bundleRoot}/content/schemas`)
const sourcesRoot = path.resolve(process.env.SOURCES_ROOT || `${bundleRoot}/content/sources`)

const outputTypes = glob.sync(`${componentSrcRoot}/output-types/*`)
  .map((fp) => path.parse(fp).name)

module.exports = {
  apiPrefix,
  bundleRoot,
  componentDistRoot,
  componentSrcRoot,
  contentBase,
  daoUrl,
  distRoot,
  environment,
  isDev,
  minify,
  mongoUrl,
  onDemand,
  outputTypes,
  port,
  prefix,
  schemasRoot,
  sourcesRoot,
  version
}

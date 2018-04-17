'use strict'

const path = require('path')

const contentBase = process.env.CONTENT_BASE || ''
const context = (process.env.CONTEXT || 'pb').replace(/^\/+/, '').replace(/\/+$/, '')
const apiPrefix = `/${context}/api/v3`
const daoUrl = process.env.DAO_URL
const environment = process.env.ENVIRONMENT
const isDev = !/^prod/i.test(process.env.NODE_ENV)
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

module.exports = {
  apiPrefix,
  bundleRoot,
  componentDistRoot,
  componentSrcRoot,
  contentBase,
  context,
  daoUrl,
  distRoot,
  environment,
  isDev,
  mongoUrl,
  onDemand,
  port,
  schemasRoot,
  sourcesRoot,
  version
}

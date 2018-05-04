'use strict'

const path = require('path')

const glob = require('glob')

const getOptionalJson = (fp) => {
  try {
    return require(fp)
  } catch (e) {
    return {}
  }
}

const env = Object.assign(
  // ordered by increasing precedence
  getOptionalJson('./env.json'),
  getOptionalJson('./environment.json'),
  process.env
)

const contentBase = env.CONTENT_BASE || ''
const contextPath = (env.CONTEXT_PATH || 'pb').replace(/^\/*/, '/').replace(/\/+$/, '')
const apiPrefix = `${contextPath}/api/v3`
const daoUrl = env.DAO_URL
const environment = env.ENVIRONMENT
const isDev = !/^prod/i.test(env.NODE_ENV)
const minify = (isDev) ? /^true$/i.test(env.MINIFY) : true
const mongoUrl = env.MONGO_URL
const onDemand = /^true$/i.test(env.ON_DEMAND)
const port = env.PORT || 8080
const version = env.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST'

const bundleRoot = path.resolve(env.BUNDLE_ROOT || `${__dirname}/../bundle`)
const distRoot = path.resolve(`${bundleRoot}/../dist`)
const componentDistRoot = path.resolve(`${distRoot}/components`)
const componentSrcRoot = path.resolve(`${bundleRoot}/components`)
const schemasRoot = path.resolve(env.SCHEMAS_ROOT || `${bundleRoot}/content/schemas`)
const sourcesRoot = path.resolve(env.SOURCES_ROOT || `${bundleRoot}/content/sources`)

const outputTypes = glob.sync(`${componentSrcRoot}/output-types/**/*.{hbs,js,jsx,vue}`)
  .map((fp) => path.parse(fp).name)

module.exports = {
  apiPrefix,
  bundleRoot,
  componentDistRoot,
  componentSrcRoot,
  contentBase,
  contextPath,
  daoUrl,
  distRoot,
  environment,
  isDev,
  minify,
  mongoUrl,
  onDemand,
  outputTypes,
  port,
  schemasRoot,
  sourcesRoot,
  version
}

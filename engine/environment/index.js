'use strict'

const path = require('path')

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

const binaryContentTypes = env.BINARY_CONTENT_TYPES
  ? env.BINARY_CONTENT_TYPES.split(/[,;]/)
  : require('./binary-content-types.json')
const bodyLimit = '100mb'
const contentBase = env.CONTENT_BASE || ''
const contextPath = (env.CONTEXT_PATH || 'pb').replace(/^\/*/, '/').replace(/\/+$/, '')
const defaultOutputType = env.DEFAULT_OUTPUT_TYPE || 'default'
const apiPrefix = `${contextPath}/api/v3`
const environment = env.ENVIRONMENT
const functionName = env.AWS_LAMBDA_FUNCTION_NAME || `fusion-engine-${environment}`
const isDev = !/^prod/i.test(env.NODE_ENV)
const minify = (isDev) ? /^true$/i.test(env.MINIFY) : true
const mongoUrl = env.MONGO_URL
const onDemand = /^true$/i.test(env.ON_DEMAND)
const port = env.PORT || 8080
const region = env.REGION || 'us-east-1'
const version = env.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST'

const bundleRoot = path.resolve(env.BUNDLE_ROOT || `${__dirname}/../bundle`)
const distRoot = path.resolve(`${bundleRoot}/../dist`)
const componentDistRoot = path.resolve(`${distRoot}/components`)
const componentSrcRoot = path.resolve(`${bundleRoot}/components`)
const schemasRoot = path.resolve(env.SCHEMAS_ROOT || `${bundleRoot}/content/schemas`)
const sourcesRoot = path.resolve(env.SOURCES_ROOT || `${bundleRoot}/content/sources`)

module.exports = {
  apiPrefix,
  binaryContentTypes,
  bodyLimit,
  bundleRoot,
  componentDistRoot,
  componentSrcRoot,
  contentBase,
  contextPath,
  defaultOutputType,
  distRoot,
  environment,
  functionName,
  isDev,
  minify,
  mongoUrl,
  onDemand,
  port,
  region,
  schemasRoot,
  sourcesRoot,
  version
}

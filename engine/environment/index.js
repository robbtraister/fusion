'use strict'

const path = require('path')

const getOptionalJson = (fp) => {
  try {
    return require(fp)
  } catch (e) {
    return {}
  }
}

const variables = Object.assign(
  // ordered by increasing precedence
  getOptionalJson('./env.json'),
  getOptionalJson('./environment.json'),
  process.env
)

const binaryContentTypes = variables.BINARY_CONTENT_TYPES
  ? variables.BINARY_CONTENT_TYPES.split(/[,;]/)
  : require('./binary-content-types.json')
const bodyLimit = '100mb'
const contentBase = variables.CONTENT_BASE || ''
const contextPath = (variables.CONTEXT_PATH || 'pb').replace(/^\/*/, '/').replace(/\/+$/, '')
const defaultOutputType = variables.DEFAULT_OUTPUT_TYPE || 'default'
const apiPrefix = `${contextPath}/api/v3`
const environment = variables.ENVIRONMENT
const functionName = variables.AWS_LAMBDA_FUNCTION_NAME || `fusion-engine-${environment}`
const isDev = !/^prod/i.test(variables.NODE_ENV)
const minify = (isDev) ? /^true$/i.test(variables.MINIFY) : true
const mongoUrl = variables.MONGO_URL
const onDemand = /^true$/i.test(variables.ON_DEMAND)
const port = variables.PORT || 8080
const region = variables.REGION || 'us-east-1'
const version = variables.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST'

const bundleRoot = path.resolve(variables.BUNDLE_ROOT || `${__dirname}/../bundle`)
const distRoot = path.resolve(`${bundleRoot}/../dist`)
const componentDistRoot = path.resolve(`${distRoot}/components`)
const componentSrcRoot = path.resolve(`${bundleRoot}/components`)
const schemasRoot = path.resolve(variables.SCHEMAS_ROOT || `${bundleRoot}/content/schemas`)
const sourcesRoot = path.resolve(variables.SOURCES_ROOT || `${bundleRoot}/content/sources`)

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
  variables,
  version
}

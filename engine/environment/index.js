'use strict'

const path = require('path')

const optionalRequire = (fp) => {
  try {
    return require(fp)
  } catch (e) {
    return {}
  }
}

const bundleRoot = path.resolve(`${__dirname}/../bundle`)

const variables = Object.assign(
  // ordered by increasing precedence
  optionalRequire(path.join(bundleRoot, 'environment')),
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

const bundleDistRoot = path.resolve(`${bundleRoot}/dist`)
const bundleGeneratedRoot = path.resolve(`${bundleRoot}/generated`)
const bundleSrcRoot = path.resolve(`${bundleRoot}/src`)
const componentDistRoot = path.resolve(`${bundleDistRoot}/components`)
const componentGeneratedRoot = path.resolve(`${bundleGeneratedRoot}/components`)
const componentSrcRoot = path.resolve(`${bundleSrcRoot}/components`)
const schemasRoot = path.resolve(variables.SCHEMAS_ROOT || `${bundleSrcRoot}/content/schemas`)
const sourcesRoot = path.resolve(variables.SOURCES_ROOT || `${bundleSrcRoot}/content/sources`)
const sourcesDistRoot = path.resolve(`${bundleDistRoot}/content/sources`)

module.exports = {
  apiPrefix,
  binaryContentTypes,
  bodyLimit,
  bundleRoot,
  bundleDistRoot,
  bundleGeneratedRoot,
  bundleSrcRoot,
  componentDistRoot,
  componentGeneratedRoot,
  componentSrcRoot,
  contentBase,
  contextPath,
  defaultOutputType,
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
  sourcesDistRoot,
  variables,
  version
}

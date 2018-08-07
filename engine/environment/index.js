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
const cacheProxy = variables.CACHE_PROXY || ''
const cachePrefix = variables.CACHE_PREFIX || ''
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

const bundleDistRoot = `${bundleRoot}/dist`
const bundleGeneratedRoot = `${bundleRoot}/generated`
const bundleSrcRoot = `${bundleRoot}/src`

const componentDistRoot = `${bundleDistRoot}/components`
const componentGeneratedRoot = `${bundleGeneratedRoot}/components`
const componentSrcRoot = `${bundleSrcRoot}/components`

const contentSrcRoot = `${bundleSrcRoot}/content`
const contentDistRoot = `${bundleDistRoot}/content`
const schemasSrcRoot = `${contentSrcRoot}/schemas`
const schemasDistRoot = `${contentDistRoot}/schemas`
const sourcesSrcRoot = `${contentSrcRoot}/sources`
const sourcesDistRoot = `${contentDistRoot}/sources`

module.exports = {
  apiPrefix,
  binaryContentTypes,
  bodyLimit,
  bundleRoot,
  bundleDistRoot,
  bundleGeneratedRoot,
  bundleSrcRoot,
  cacheProxy,
  cachePrefix,
  componentDistRoot,
  componentGeneratedRoot,
  componentSrcRoot,
  contentBase,
  contentSrcRoot,
  contentDistRoot,
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
  schemasDistRoot,
  schemasSrcRoot,
  sourcesDistRoot,
  sourcesSrcRoot,
  variables,
  version
}

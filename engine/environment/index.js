'use strict'

const path = require('path')

const unpack = require('../src/utils/unpack')

function optionalRequire (fp) {
  try {
    return unpack(require(fp))
  } catch (e) {
    return {}
  }
}

const projectRoot = path.resolve(__dirname, '..')
const bundleRoot = path.resolve(projectRoot, 'bundle')
const engineSrcRoot = path.resolve(projectRoot, 'src')

const buildRoot = path.resolve(bundleRoot, '.fusion', 'build')
const distRoot = path.resolve(bundleRoot, '.fusion', 'dist')
const generatedRoot = path.resolve(bundleRoot, '.fusion', 'generated')

const variables = Object.assign(
  {},
  // ordered by increasing precedence
  optionalRequire(path.join(buildRoot, 'environment')),
  optionalRequire(path.join(bundleRoot, 'environment')),
  process.env
)

const isProd = /^prod/i.test(variables.NODE_ENV)
const isDev = !isProd

const binaryContentTypes = (variables.BINARY_CONTENT_TYPES)
  ? variables.BINARY_CONTENT_TYPES.split(/[,;]/)
  : require('./binary-content-types.json')

const bodyLimit = '100mb'
const cacheProxyUrl = variables.CACHE_PROXY_URL || ''
const cachePrefix = variables.CACHE_PREFIX || ''
const contentBase = variables.CONTENT_BASE || ''
const contextPath = (variables.CONTEXT_PATH || 'pf').replace(/^\/*/, '/').replace(/\/+$/, '')
const datadogApiKey = variables.DATADOG_API_KEY || ''
const defaultTTL = Math.max(Number(variables.DEFAULT_TTL) || 300, 120)
const defaultOutputType = variables.DEFAULT_OUTPUT_TYPE || 'default'
const environment = variables.ENVIRONMENT
const functionName = variables.AWS_LAMBDA_FUNCTION_NAME || `fusion-engine-${environment}`
const metricsTimeout = +variables.METRICS_TIMEOUT || 100
const minify = isProd || /^true$/i.test(variables.MINIFY)
const mongoUrl = variables.MONGO_URL
// const onDemand = /^true$/i.test(variables.ON_DEMAND)
const port = variables.PORT || 8080
const region = variables.AWS_REGION || 'us-east-1'
const s3BucketDiscrete = variables.S3BUCKET_DISCRETE || variables.S3BUCKET || 'pagebuilder-fusion'
const s3BucketVersioned = variables.S3BUCKET_VERSIONED || 'pagebuilder-fusion'
const semver = variables.FUSION_RELEASE

const apiPrefix = `${contextPath}/api/v3`

const deployment = require('./deployment')(variables.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST')

module.exports = {
  apiPrefix,
  binaryContentTypes,
  bodyLimit,
  buildRoot,
  bundleRoot,
  cacheProxyUrl,
  cachePrefix,
  contentBase,
  contextPath,
  datadogApiKey,
  defaultOutputType,
  defaultTTL,
  deployment,
  distRoot,
  engineSrcRoot,
  functionName,
  generatedRoot,
  isDev,
  isProd,
  metricsTimeout,
  minify,
  mongoUrl,
  port,
  region,
  s3BucketDiscrete,
  s3BucketVersioned,
  semver,
  variables
}

'use strict'

const path = require('path')

const unpack = require('../src/utils/unpack')

const optionalRequire = (fp) => {
  try {
    return unpack(require(fp))
  } catch (e) {
    return {}
  }
}

const bundleRoot = path.resolve(`${__dirname}/../bundle`)

const bundleBuildRoot = `${bundleRoot}/build`
const bundleDistRoot = `${bundleRoot}/dist`
const bundleGeneratedRoot = `${bundleRoot}/generated`
const bundleSrcRoot = `${bundleRoot}/src`

const componentBuildRoot = `${bundleBuildRoot}/components`
const componentDistRoot = `${bundleDistRoot}/components`
const componentGeneratedRoot = `${bundleGeneratedRoot}/components`
const componentSrcRoot = `${bundleSrcRoot}/components`

const contentBuildRoot = `${bundleBuildRoot}/content`
const contentDistRoot = `${bundleDistRoot}/content`
const contentSrcRoot = `${bundleSrcRoot}/content`

const schemasBuildRoot = `${contentBuildRoot}/schemas`
const schemasSrcRoot = `${contentSrcRoot}/schemas`

const sourcesBuildRoot = `${contentBuildRoot}/sources`
const sourcesDistRoot = `${contentDistRoot}/sources`
const sourcesSrcRoot = `${contentSrcRoot}/sources`

const variables = Object.assign(
  {},
  // ordered by increasing precedence
  optionalRequire(path.join(bundleBuildRoot, 'environment')),
  optionalRequire(path.join(bundleSrcRoot, 'environment')),
  process.env
)

const binaryContentTypes = variables.BINARY_CONTENT_TYPES
  ? variables.BINARY_CONTENT_TYPES.split(/[,;]/)
  : require('./binary-content-types.json')
const bodyLimit = '100mb'
const cacheProxyUrl = variables.CACHE_PROXY_URL || ''
const cachePrefix = variables.CACHE_PREFIX || ''
const contentBase = variables.CONTENT_BASE || ''
const contextPath = (variables.CONTEXT_PATH || 'pf').replace(/^\/*/, '/').replace(/\/+$/, '')
const datadogApiKey = variables.DATADOG_API_KEY || ''
const defaultOutputType = variables.DEFAULT_OUTPUT_TYPE || 'default'
const deployment = variables.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST'
const environment = variables.ENVIRONMENT
const functionName = variables.AWS_LAMBDA_FUNCTION_NAME || `fusion-engine-${environment}`
const isDev = !/^prod/i.test(variables.NODE_ENV)
const minify = (isDev) ? /^true$/i.test(variables.MINIFY) : true
const mongoUrl = variables.MONGO_URL
const onDemand = /^true$/i.test(variables.ON_DEMAND)
const port = variables.PORT || 8080
const region = variables.AWS_REGION || 'us-east-1'
const s3BucketDiscrete = variables.S3BUCKET_DISCRETE || variables.S3BUCKET || 'pagebuilder-fusion'
const s3BucketVersioned = variables.S3BUCKET_VERSIONED || 'pagebuilder-fusion'
const semver = variables.FUSION_RELEASE

const apiPrefix = `${contextPath}/api/v3`

module.exports = {
  apiPrefix,
  binaryContentTypes,
  bodyLimit,
  bundleRoot,
  bundleBuildRoot,
  bundleDistRoot,
  bundleGeneratedRoot,
  bundleSrcRoot,
  cacheProxyUrl,
  cachePrefix,
  componentBuildRoot,
  componentDistRoot,
  componentGeneratedRoot,
  componentSrcRoot,
  contentBase,
  contentBuildRoot,
  contentDistRoot,
  contentSrcRoot,
  contextPath,
  datadogApiKey,
  defaultOutputType,
  deployment,
  environment,
  functionName,
  isDev,
  minify,
  mongoUrl,
  onDemand,
  port,
  region,
  s3BucketDiscrete,
  s3BucketVersioned,
  schemasBuildRoot,
  schemasSrcRoot,
  semver,
  sourcesBuildRoot,
  sourcesDistRoot,
  sourcesSrcRoot,
  variables,
  version: deployment
}

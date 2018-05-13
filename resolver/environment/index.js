'use strict'

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

const environment = env.ENVIRONMENT
const daoUrl = env.DAO_URL
const httpEngine = env.HTTP_ENGINE
const isDev = !/^prod/i.test(env.NODE_ENV)
// if LAMBDA_ENGINE is defined, use it
// if not, use HTTP_ENGINE
// if neither is defined, construct default AWS LAMBDA ARN
const lambdaEngine = env.LAMBDA_ENGINE || (
  httpEngine
    ? null
    : `arn:aws:lambda:${env.AWS_REGION || 'us-east-1'}:${env.AWS_ACCOUNT_ID || '397853141546'}:function:fusion-engine-${environment}-engine}`
)
const resolveFromDB = env.RESOLVE_FROM_DB
const trailingSlashRule = (env.TRAILING_SLASH_RULE || 'NOOP').toUpperCase()

module.exports = {
  daoUrl,
  environment,
  httpEngine,
  isDev,
  lambdaEngine,
  resolveFromDB,
  trailingSlashRule
}

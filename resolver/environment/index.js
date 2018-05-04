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
const isDev = !/^prod/i.test(env.NODE_ENV)
const daoUrl = env.DAO_URL
const resolveFromDB = env.RESOLVE_FROM_DB
const trailingSlashRule = (env.TRAILING_SLASH_RULE || 'NOOP').toUpperCase()

module.exports = {
  daoUrl,
  environment,
  isDev,
  resolveFromDB,
  trailingSlashRule
}

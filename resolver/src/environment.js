'use strict'

const environment = process.env.ENVIRONMENT
const isDev = !/^prod/i.test(process.env.NODE_ENV)
const daoUrl = process.env.DAO_URL
const resolveFromDB = process.env.RESOLVE_FROM_DB
const trailingSlashRule = (process.env.TRAILING_SLASH_RULE || 'NOOP').toUpperCase()

module.exports = {
  daoUrl,
  environment,
  isDev,
  resolveFromDB,
  trailingSlashRule
}

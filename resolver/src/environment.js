'use strict'

const environment = process.env.ENVIRONMENT
const isDev = !/^prod/i.test(process.env.NODE_ENV)
const daoUrl = process.env.DAO_URL
const useDB = process.env.USE_DB
const trailingSlashRule = process.env.TRAILING_SLASH_RULE || 'NOOP'

module.exports = {
  environment,
  isDev,
  trailingSlashRule,
  daoUrl,
  useDB
}

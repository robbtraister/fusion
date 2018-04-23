'use strict'

const environment = process.env.ENVIRONMENT
const isDev = !/^prod/i.test(process.env.NODE_ENV)
const trailingSlashRule = process.env.TRAILING_SLASH_RULE || 'NOOP'

module.exports = {
  environment,
  isDev,
  trailingSlashRule
}

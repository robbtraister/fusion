'use strict'

const environment = process.env.ENVIRONMENT
const isDev = !/^prod/i.test(process.env.NODE_ENV)
const forceTrailingSlash = process.env.FORCE_TRAILING_SLASH === 'true'

module.exports = {
  environment,
  isDev,
  forceTrailingSlash
}

'use strict'

const url = require('url')

const { trailingSlashRule } = require('../environment')

const TRAILING_SLASH_PATTERN = {
  DROP: /\/+$/,
  FORCE: /\/[^./]+$/
}

const TRAILING_SLASH_REWRITES = {
  DROP: (uri) => uri.replace(TRAILING_SLASH_PATTERN.DROP, ''),
  FORCE: (uri) => uri.replace(TRAILING_SLASH_PATTERN.FORCE, (match) => `${match}/`),
  NOOP: (uri) => uri
}

const RedirectError = (statusCode, location) => {
  const e = new Error('redirect')
  e.statusCode = statusCode
  e.location = location
  return e
}

const trailingSlashRedirectMiddleware = (rule) =>
  TRAILING_SLASH_PATTERN[rule]
    ? null
    : (req, res, next) => {
      const parts = url.parse(req.url)
      TRAILING_SLASH_PATTERN[rule].test(parts.pathname)
        ? next(RedirectError(302, url.format(Object.assign(parts, {pathname: TRAILING_SLASH_REWRITES[rule](parts.pathname)}))))
        : next()
    }

module.exports = {
  TRAILING_SLASH_REWRITES,
  trailingSlashRedirect: trailingSlashRedirectMiddleware(trailingSlashRule),
  trailingSlashRewrite: TRAILING_SLASH_REWRITES[trailingSlashRule] || TRAILING_SLASH_REWRITES.NOOP
}

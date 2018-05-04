'use strict'

const url = require('url')

const { trailingSlashRule } = require('../../environment')

const { RedirectError } = require('../errors')

const TRAILING_SLASH_PATTERN = {
  DROP: /\/+$/,
  FORCE: /\/[^./]+$/
}

const TRAILING_SLASH_REWRITES = {
  DROP: (uri) => uri.replace(TRAILING_SLASH_PATTERN.DROP, ''),
  FORCE: (uri) => uri.replace(TRAILING_SLASH_PATTERN.FORCE, (match) => `${match}/`),
  NOOP: (uri) => uri
}

const trailingSlashRedirectMiddleware = (rule) =>
  TRAILING_SLASH_PATTERN[rule]
    ? (req, res, next) => {
      const parts = url.parse(req.url)
      TRAILING_SLASH_PATTERN[rule].test(parts.pathname)
        ? next(new RedirectError(url.format(Object.assign(parts, {pathname: TRAILING_SLASH_REWRITES[rule](parts.pathname)}))))
        : next()
    }
    : null

module.exports = {
  TRAILING_SLASH_REWRITES,
  trailingSlashRedirect: trailingSlashRedirectMiddleware(trailingSlashRule),
  trailingSlashRewrite: TRAILING_SLASH_REWRITES[trailingSlashRule] || TRAILING_SLASH_REWRITES.NOOP
}

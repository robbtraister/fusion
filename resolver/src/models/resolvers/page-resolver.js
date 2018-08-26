'use strict'

const BaseResolver = require('./base-resolver')

const {
  TRAILING_SLASH_REWRITES
} = require('../../utils/trailing-slash-rule')

class PageResolver extends BaseResolver {
  constructor (config) {
    super(config)

    this.type = 'page'

    this.id = config.id || config._id
    this.uri = TRAILING_SLASH_REWRITES.DROP(config.uri)
    this.sites = config.sites
  }

  match (requestParts, arcSite) {
    return this.uri === TRAILING_SLASH_REWRITES.DROP(requestParts.pathname) && this.matchSite(arcSite)
  }

  rendering (content) {
    return {
      type: this.type,
      id: this.id
    }
  }

  static sort (a, b) {
    if ((a.sites && a.sites.length) && !(b.sites && b.sites.length)) return -1
    if (!(a.sites && a.sites.length) && (b.sites && b.sites.length)) return 1
  }
}

module.exports = PageResolver

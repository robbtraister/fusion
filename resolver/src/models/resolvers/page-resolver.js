'use strict'

const BaseResolver = require('./base-resolver')

const {
  TRAILING_SLASH_REWRITES
} = require('../../utils/trailing-slash-rule')

class PageResolver extends BaseResolver {
  constructor (config) {
    super(config)

    this.type = 'page'

    this.uri = TRAILING_SLASH_REWRITES.DROP(config.uri)
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
}

module.exports = PageResolver

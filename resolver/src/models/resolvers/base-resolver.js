'use strict'

class BaseResolver {
  constructor (config) {
    this.config = config
    this.sites = config.sites
  }

  async hydrate (requestParts, arcSite, version) {
    return {
      key: null,
      content: null
    }
  }

  match (requestParts, arcSite) {
    throw new Error('not implemented')
  }

  matchSite (arcSite) {
    return (this.sites && this.sites.length)
      ? this.sites.includes(arcSite)
      : true
  }

  rendering (content) {
    throw new Error('not implemented')
  }

  async resolve (requestParts, arcSite, version) {
    const {key, content} = await this.hydrate(requestParts, arcSite, version)

    return Object.assign(
      {
        // keep requestUri temporarily for backwards compatibility
        requestUri: requestParts.href,
        request: {
          uri: requestParts.href,
          path: requestParts.pathname,
          query: requestParts.query
        },
        rendering: this.rendering(content),
        // remove versions from page config
        resolver: Object.assign({}, this.config, {versions: undefined})
      },
      (key)
        ? {
          content: {
            source: this.config.contentSourceId,
            key,
            document: content
          }
        }
        : {}
    )
  }
}

module.exports = BaseResolver

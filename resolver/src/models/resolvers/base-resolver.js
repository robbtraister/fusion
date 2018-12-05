'use strict'

class BaseResolver {
  constructor (config) {
    this.config = config

    this.id = config.id || config._id
    this.sites = config.sites
    this.hasSites = config.sites && config.sites.length
  }

  async hydrate (requestParts, params) {
    return {
      query: null,
      content: null
    }
  }

  match (requestParts, arcSite) {
    throw new Error('not implemented')
  }

  matchSite (arcSite) {
    return (this.hasSites)
      ? this.sites.includes(arcSite)
      : true
  }

  rendering (content) {
    throw new Error('not implemented')
  }

  async resolve (requestParts, params) {
    const { query, content } = await this.hydrate(requestParts, params)

    return Object.assign(
      {
        request: {
          uri: requestParts.href,
          path: requestParts.pathname,
          query: requestParts.query
        },
        // remove versions from page config
        resolver: Object.assign({}, this.config, { versions: undefined }),
        rendering: this.rendering(content)
      },
      (content)
        ? {
          content: {
            source: this.config.contentSourceId,
            query,
            // TODO: rename to .data after migrating everyone to 2.1
            document: content.data,
            expires: content.expires,
            lastModified: content.lastModified
          }
        }
        : {}
    )
  }

  static sort (a, b) {
    if (a.hasSites && !b.hasSites) return -1
    if (!a.hasSites && b.hasSites) return 1
  }
}

module.exports = BaseResolver

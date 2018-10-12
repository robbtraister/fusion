'use strict'

const url = require('url')

const _get = require('lodash.get')

const debugLogger = require('debug')('fusion:resolver:template')

const BaseResolver = require('./base-resolver')

const engine = require('../../utils/engine')

const { RedirectError, NotFoundError } = require('../../errors')

const fetch = function fetch (contentSource, contentKey, version) {
  return engine({
    uri: `/content/fetch/${contentSource}?key=${encodeURIComponent(JSON.stringify(contentKey))}`,
    version
  })
}

const getParamMapper = function getParamMapper (param) {
  return {
    parameter: (requestParts) => ({ [param.key]: requestParts.query[param.name] }),
    pattern: (requestParts, groups) => ({ [param.key]: groups[param.index] }),
    static: () => ({ [param.key]: param.value })
  }[param.type]
}

const getParamExtractor = function getParamExtractor (contentConfigMapping, pattern) {
  if (contentConfigMapping) {
    const params = Object.keys(contentConfigMapping)
      .map(key => Object.assign({ key }, contentConfigMapping[key]))

    if (params.length) {
      const hasPatternParam = !!params.find(param => param.type === 'pattern')
      const paramMappers = params.map(getParamMapper)

      return (requestParts) => {
        const groups = (hasPatternParam)
          ? requestParts.pathname.match(pattern)
          : {}

        return Object.assign({},
          ...paramMappers.map(mapper => mapper && mapper(requestParts, groups))
        )
      }
    }
  }

  return () => ({})
}

class TemplateResolver extends BaseResolver {
  constructor (config) {
    super(config)

    this.type = 'template'

    this.pattern = new RegExp(config.pattern) // the resolver URI pattern
    this.template = config.page

    this.contentMapping = config.content2pageMapping

    this.params = config.params.map(param => ({
      name: param.name,
      pattern: new RegExp(param.value),
      required: !!param.required
    }))

    this.requiredParams = this.params.filter(param => param.required)
    this.optionalParams = this.params.filter(param => !param.required)

    this.paramExtractor = getParamExtractor(config.contentConfigMapping, this.pattern)
  }

  async hydrate (requestParts, arcSite, version) {
    const key = Object.assign(
      {
        uri: requestParts.pathname,
        'arc-site': arcSite
      },
      this.paramExtractor(requestParts)
    )

    return fetch(this.config.contentSourceId, key, version)
      .catch((err) => {
        if (err.statusCode === 404) {
          throw new NotFoundError(`Could not resolve ${requestParts.href}`, {
            requestUri: requestParts.href,
            cause: `Resolver matched, but content could not be fetched. Make sure this is the correct resolver.`,
            resolver: this.config
          })
        }

        throw err
      })
      .then((content) => ({ key, content }))
  }

  matchRequiredParams (requestParams) {
    return this.requiredParams.every(param => param.pattern.test(requestParams[param.name]))
  }

  matchOptionalParams (requestParts) {
    const queryParams = requestParts.query

    const mismatchParams = this.optionalParams
      .filter(param => ((param.name in queryParams) && !param.pattern.test(queryParams[param.name])))
      .map(param => param.name)

    if (mismatchParams.length > 0) {
      delete requestParts.search

      const query = {}
      Object.keys(requestParts.query)
        .filter(key => !mismatchParams.includes(key))
        .forEach(key => { query[key] = requestParts.query[key] })
      requestParts.query = query

      debugLogger(`Redirect issued: ${JSON.stringify(url.format(requestParts))}`)
      throw new RedirectError(url.format(requestParts))
    }

    return true
  }

  match (requestParts, arcSite) {
    return this.pattern.test(requestParts.pathname) &&
      this.matchRequiredParams(requestParts.query) &&
      this.matchOptionalParams(requestParts) &&
      this.matchSite(arcSite)
  }

  rendering (content) {
    const id = (this.contentMapping)
      ? this.contentMapping.mapping[_get(content, this.contentMapping.field)] || this.template
      : this.template

    return {
      type: this.type,
      id
    }
  }

  static sort (a, b) {
    return +a.priority - +b.priority
  }
}

module.exports = TemplateResolver

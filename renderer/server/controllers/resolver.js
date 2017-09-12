'use strict'

const debug = require('debug')('server:controllers:resolver')

const resolvers = require('../../resolvers')
  .map(resolver => {
    const match = (resolver.match instanceof RegExp)
      ? resolver.match.exec.bind(resolver.match)
      : uri => resolver.match === uri ? uri : null

    const content = (typeof resolver.content === 'function' || resolver.content instanceof Function)
      ? resolver.content
      : () => resolver.content

    return {
      match,
      template: resolver.template,
      content
    }
  })

function resolve (uri) {
  debug('resolving', uri)

  let match
  const resolver = resolvers.find(resolver => {
    match = resolver.match(uri)
    return match
  })

  if (resolver) {
    return Promise.resolve({
      template: resolver.template,
      content: resolver.content(match)
    })
  }

  return Promise.reject(new Error('NO_MATCH'))
}

module.exports = resolve

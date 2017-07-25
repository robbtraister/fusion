#!/usr/bin/env node

'use strict'

require('babel-core/register')

const Resolver = require('./resolver')
const Content = require('./content')
const Templates = require('./templates')

const fetcher = require('../../content/fetcher/server')
const engine = require(`../../engine/server`)

function Rendering (uri, options) {
  if (!(this instanceof Rendering)) {
    return new Rendering(uri, options)
  }

  this.options = options || {}
  this.options.hydrated = false

  this.uri = uri
  Object.assign(this, fetcher(), Resolver.resolve(uri))
  // this.contentURI = Content.resolve(uri)
  // this.templateName = Templates.resolve(uri)
  this.component = Templates.load(this.templateName)
}

Rendering.prototype.hydrate = function () {
  return Content.fetch(this.contentURI)
    .then(JSON.parse.bind(JSON))
    .then(content => {
      this.content = content
      this.options.hydrated = true

      // render with no cache; fetch will populate it as necessary
      let dehydratedHTMLPromise = engine(this)
      let cacheKeys = Object.keys(this.cache)

      let cachePromise = Promise.all(cacheKeys.map(k => this.cache[k]))

      return {
        // if getting content, we want it populated with the global content
        // if rendering, we don't want to add global content to the html
        // so don't add to the cache until we know which we are doing
        // if a component requested global content uri, it will already be added
        content: () => cachePromise
          .then(() => { this.cache[this.contentURI] = content })
          .then(() => this.cache),
        // if no component content, don't re-render
        render: () => cacheKeys.length
          ? cachePromise.then(() => engine(this))
          : dehydratedHTMLPromise
      }
    })
}

function content (uri, options) {
  return new Rendering(uri, options)
    .hydrate()
    .then(data => data.content())
}

function renderDehydrated (uri) {
  return engine(new Rendering(uri, { includeScripts: true }))
}

function renderHydrated (uri, options) {
  return new Rendering(uri, options)
    .hydrate()
    .then(data => data.render())
}

module.exports = renderHydrated
module.exports.content = content
module.exports.renderDehydrated = renderDehydrated
module.exports.renderHydrated = renderHydrated

if (module === require.main) {
  renderDehydrated(process.argv[2] || '/')
    .then(console.log)
    .then(console.error)
}

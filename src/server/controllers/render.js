'use strict'

require('babel-core/register')

const debug = require('debug')(`fusion:controllers:render:${process.pid}`)

const ReactDOMServer = require('react-dom/server')
const request = require('request-promise-native')

const Content = require('./content')
const Templates = require('./templates')
const wrapper = require('./wrapper')

function Rendering (uri, options) {
  if (!(this instanceof Rendering)) {
    return new Rendering(uri, options)
  }

  this.options = options || {}
  this.options.hydrated = false

  this.contentURI = Content.resolve(uri)
  this.templateName = Templates.resolve(uri)
  this.component = Templates.load(this.templateName)
}

Rendering.prototype.render = function () {
  return render(this)
}

Rendering.prototype.hydrate = function () {
  this.options.hydrated = true

  return Content.fetch(this.contentURI)
    .then(JSON.parse.bind(JSON))
    .then(content => {
      this.content = content

      this.cache = {}
      this.fetch = (uri, component, asyncOnly) => {
        if (!asyncOnly) {
          debug('sync fetching', uri)

          if (this.cache.hasOwnProperty(uri)) {
            if (!(this.cache[uri] instanceof Promise)) {
              return this.cache[uri]
            }
          } else {
            // don't add global content to the cache unless a component requests it
            this.cache[uri] = (
              (uri === this.contentURI)
              ? content
              : request({
                uri: `http://localhost:8080${uri}`,
                json: true
              })
            ).then(json => { this.cache[uri] = json })
          }
        }
        return null
      }

      // render with no cache; fetch will populate it as necessary
      let dehydratedHTML = this.render()
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
          ? cachePromise.then(() => this.render())
          : dehydratedHTML
      }
    })
}

function render (rendering) {
  return '<!DOCTYPE html>' +
    ReactDOMServer.renderToStaticMarkup(
      wrapper(rendering)
    )
}

function content (uri, options) {
  return new Rendering(uri, options)
    .hydrate()
    .then(data => data.content())
}

function renderDehydrated (uri) {
  return Promise.resolve(render(new Rendering(uri, { includeScripts: true })))
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
  renderDehydrated(process.argv[2] || '/').then(console.log)
}

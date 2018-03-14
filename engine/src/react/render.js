#!/usr/bin/env node

'use strict'

const debugTimer = require('debug')('fusion:timer:react:render')

const ReactDOM = require('react-dom/server')

const compile = require('./compile')
const Provider = require('./components/provider')
const OutputType = require('../../dist/components/output-types/html.jsx')

const timer = require('../timer')

const render = function render ({requestUri, content, Component}) {
  const renderHtml = () => ReactDOM.renderToStaticMarkup(Component({
    globalContent: content,
    requestUri
  }))

  let tic = timer.tic()
  return Promise.resolve(renderHtml())
    .then((html) => {
      debugTimer('first render', tic.toc())
      tic = timer.tic()

      // collect content cache into Promise array
      const cacheMap = Component.cacheMap || {}
      const contentPromises = [].concat(...Object.keys(cacheMap).map(source => {
        const sourceCache = cacheMap[source]
        return Object.keys(sourceCache).map(key => sourceCache[key].promise)
      }))

      return contentPromises.length === 0
        // if no feature content is requested, return original rendering
        ? Promise.resolve(html)
        // if feature content is requested, wait for it, then render again
        : Promise.all(contentPromises)
          .then(() => {
            debugTimer('content hydration', tic.toc())
            tic = timer.tic()
          })
          .then(renderHtml)
          .then((html) => {
            debugTimer('second render', tic.toc())
            return html
          })
    })
}

const compileRenderable = function compileRenderable (rendering) {
  let tic = timer.tic()
  return Promise.resolve(compile(rendering))
    .then(Feature => {
      debugTimer('compilation', tic.toc())
      tic = timer.tic()
      return Provider(Feature)
    })
    .then((Component) => {
      debugTimer('provider wrapping', tic.toc())
      return Component
    })
}

const compileOutputType = function compileOutputType (rendering) {
  let tic
  return compileRenderable(rendering)
    .then((Feature) => {
      tic = timer.tic()
      const Component = OutputType(Feature)
      // bubble up the Provider cacheMap
      Component.cacheMap = Feature.cacheMap
      return Component
    })
    .then((Component) => {
      debugTimer('output-type wrapping', tic.toc())
      return Component
    })
}

module.exports = {
  compileOutputType,
  compileRenderable,
  render
}

if (module === require.main) {
  const input = (process.argv.length > 2)
    ? Promise.resolve(process.argv[2])
    : new Promise((resolve, reject) => {
      let data = ''
      process.stdin.on('data', (chunk) => {
        data += chunk
      })
      process.stdin.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    })

  input
    .then((rendering) => render({template: rendering}))
    .then(console.log)
    .catch(console.error)
}

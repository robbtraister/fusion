#!/usr/bin/env node

'use strict'

const ReactDOM = require('react-dom/server')

const compile = require('./compile')
const Provider = require('./components/provider')

const getRendering = function getRendering (template) {
  return template
}

const render = function render ({requestUri, content, template}) {
  const Template = Provider(compile(getRendering(template)))

  const renderHtml = () => ReactDOM.renderToStaticMarkup(Template({
    globalContent: content,
    requestUri
  }))

  // render once without feature content
  const html = renderHtml()

  // collect content cache into Promise array
  const cacheMap = Template.cacheMap || {}
  const contentPromises = [].concat(...Object.keys(cacheMap).map(source => {
    const sourceCache = cacheMap[source]
    return Object.keys(sourceCache).map(key => sourceCache[key].promise)
  }))

  return contentPromises.length === 0
    // if no feature content is requested, return original rendering
    ? Promise.resolve(html)
    // if feature content is requested, wait for it, then render again
    : Promise.all(contentPromises)
      .then(renderHtml)
}

module.exports = render

if (module === require.main) {
  const input = (process.argv.length > 2)
    ? Promise.resolve(require(process.argv[2]))
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
    .then((rendering) => render(rendering))
    .then(console.log)
    .catch(console.error)
}

#!/usr/bin/env node

'use strict'

const debugTimer = require('debug')('fusion:timer:react:render')

const React = require('react')
const ReactDOM = require('react-dom/server')

const compile = require('./compile/component')
const Provider = require('./provider')
const OutputType = require('../../../dist/components/output-types/react.jsx')

const timer = require('../../timer')

const {
  getApiPrefix,
  getScriptUri,
  getVersion
} = require('../../scripts')

const CONTEXT = (process.env.CONTEXT || 'pb').replace(/^\/*/, '/')
const ON_DEMAND = process.env.ON_DEMAND === 'true'

const engineScript = React.createElement(
  'script',
  {
    key: 'engine',
    type: 'application/javascript',
    src: `${getApiPrefix()}/scripts/engine/react.js?v=${getVersion()}`,
    defer: true
  }
)
// const componentsScript = React.createElement(
//   'script',
//   {
//     key: 'components',
//     type: 'application/javascript',
//     src: `${getApiPrefix()}/scripts/components/all.js?v=${getVersion()}`,
//     defer: true
//   }
// )

function getFusionScript (globalContent, cacheMap) {
  const condensedMap = {}
  Object.keys(cacheMap)
    .forEach(sourceName => {
      condensedMap[sourceName] = {}
      Object.keys(cacheMap[sourceName])
        .forEach(key => {
          condensedMap[sourceName][key] = cacheMap[sourceName][key].filtered
        })
    })

  return `window.Fusion=window.Fusion||{};` +
    `Fusion.context='${CONTEXT}';` +
    `Fusion.isFresh=${ON_DEMAND ? 'true' : 'false'};` +
    `Fusion.globalContent=${JSON.stringify(globalContent || {})};` +
    `Fusion.contentCache=${JSON.stringify(condensedMap)}`
}

const render = function render ({Component, requestUri, content}) {
  const renderHTML = () => new Promise((resolve, reject) => {
    try {
      const html = ReactDOM.renderToStaticMarkup(
        React.createElement(
          Component,
          {
            globalContent: content,
            requestUri
          }
        )
      )
      resolve(html)
    } catch (e) {
      reject(e)
    }
  })

  let tic = timer.tic()
  return renderHTML()
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
          .then(renderHTML)
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
      debugTimer(`compile(${rendering._id})`, tic.toc())
      tic = timer.tic()
      return Provider(Feature)
    })
    .then((Component) => {
      debugTimer('provider wrapping', tic.toc())
      return Component
    })
}

const compileOutputType = function compileOutputType (rendering, pt) {
  let tic
  return compileRenderable(rendering)
    .then((Feature) => {
      tic = timer.tic()

      const Component = (props) => React.createElement(
        OutputType,
        {
          scripts: [
            engineScript,
            // componentsScript,
            React.createElement(
              'script',
              {
                key: 'template',
                type: 'application/javascript',
                src: `${getScriptUri(pt)}?v=${getVersion()}`, // &isAdmin=true
                defer: true
              }
            )
          ],
          fusion: React.createElement(
            'script',
            {
              type: 'application/javascript',
              dangerouslySetInnerHTML: { __html: getFusionScript(props.globalContent, Feature.cacheMap) }
            }
          )
        },
        React.createElement(
          Feature,
          // pass down the original props
          props
        )
      )

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

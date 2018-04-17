#!/usr/bin/env node

'use strict'

const debugTimer = require('debug')('fusion:timer:react:render')

const React = require('react')
const ReactDOM = require('react-dom/server')

const compile = require('./compile/component')
const Provider = require('./provider')

const timer = require('../../timer')

const {
  getApiPrefix,
  getScriptUri,
  getVersion
} = require('../../scripts')

const {
  componentDistRoot,
  context,
  onDemand
} = require('../../environment')

// this wrapper allows a function to be used in JSX without parentheses
// use `{props.scripts}` to execute the function with the defaults
// use `{props.scripts(true)}` to execute the function with custom inputs
function propFunction (fn) {
  fn[Symbol.iterator] = function () {
    let done = false
    return {
      next () {
        const result = (done)
          ? {done}
          : {
            value: fn(),
            done: false
          }
        done = true
        return result
      }
    }
  }
  return fn
}

const engineScript = React.createElement(
  'script',
  {
    key: 'engine',
    type: 'application/javascript',
    src: `${getApiPrefix()}/scripts/engine/react.js?v=${getVersion()}`,
    defer: true
  }
)
const componentsScript = React.createElement(
  'script',
  {
    key: 'components',
    type: 'application/javascript',
    src: `${getApiPrefix()}/scripts/components/all.js?v=${getVersion()}`,
    defer: true
  }
)

function getFusionScript (globalContent, contentCache, refreshContent) {
  const condensedCache = {}
  Object.keys(contentCache)
    .forEach(sourceName => {
      condensedCache[sourceName] = {}
      Object.keys(contentCache[sourceName])
        .forEach(key => {
          condensedCache[sourceName][key] = {cached: contentCache[sourceName][key].filtered}
        })
    })

  return `window.Fusion=window.Fusion||{};` +
    `Fusion.prefix='${context}';` +
    `Fusion.refreshContent=${onDemand ? 'false' : !!refreshContent};` +
    `Fusion.globalContent=${JSON.stringify(globalContent || {})};` +
    `Fusion.contentCache=${JSON.stringify(condensedCache)}`
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
      const contentCache = Component.contentCache || {}
      const contentPromises = [].concat(...Object.keys(contentCache).map(source => {
        const sourceCache = contentCache[source]
        return Object.keys(sourceCache).map(key => sourceCache[key].fetched)
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

const compileRenderable = function compileRenderable (rendering, outputType) {
  let tic = timer.tic()
  return Promise.resolve(compile(rendering, outputType))
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

const compileDocument = function compileDocument (rendering, outputType, pt) {
  let tic
  return compileRenderable(rendering, outputType)
    .then((Template) => {
      tic = timer.tic()

      const OutputType = (() => {
        try {
          return require(`${componentDistRoot}/output-types/${outputType || 'react'}.jsx`)
        } catch (e) {
          const err = new Error(`Could not find output-type: ${outputType}`)
          err.statusCode = 400
          throw err
        }
      })()

      const Component = (props) => {
        return React.createElement(
          OutputType,
          {
            /*
             * Each of the following are equivalent in JSX
             *   {props.libs}
             *   {props.libs()}
             *   {props.libs(false)}
             *   {props.libs({useComponentLib: false})}
             *
             * To use the complete component library
             * (faster compilation, but larger payload; suitable for faster changes in admin)
             *   {props.libs(true)}
             *   {props.libs({useComponentLib: true})}
             */
            libs: propFunction(function (useComponentLib) {
              if (typeof useComponentLib === 'object') {
                useComponentLib = useComponentLib.useComponentLib
              }
              useComponentLib = (useComponentLib === undefined) ? false : !!useComponentLib

              const templateScript = React.createElement(
                'script',
                {
                  key: 'template',
                  type: 'application/javascript',
                  src: `${getScriptUri(pt)}?v=${getVersion()}${useComponentLib ? '&useComponentLib=true' : ''}`,
                  defer: true
                }
              )

              return (useComponentLib)
                ? [
                  engineScript,
                  componentsScript,
                  templateScript
                ]
                : [
                  engineScript,
                  templateScript
                ]
            }),
            /*
             * Each of the following are equivalent in JSX
             *   {props.fusion}
             *   {props.fusion()}
             *   {props.fusion(true)}
             *   {props.fusion({refreshContent: true})}
             *
             * To disable client-side content refresh
             *   {props.fusion(false)}
             *   {props.fusion({refreshContent: false})}
             */
            fusion: propFunction(function (refreshContent) {
              if (typeof refreshContent === 'object') {
                refreshContent = refreshContent.refreshContent
              }
              refreshContent = refreshContent === undefined ? true : !!refreshContent
              return React.createElement(
                'script',
                {
                  type: 'application/javascript',
                  dangerouslySetInnerHTML: { __html: getFusionScript(props.globalContent, Template.contentCache, refreshContent) }
                }
              )
            })
          },
          React.createElement(
            Template,
            // pass down the original props
            props
          )
        )
      }

      // bubble up the Provider contentCache
      Component.contentCache = Template.contentCache
      return Component
    })
    .then((Component) => {
      debugTimer('output-type wrapping', tic.toc())
      return Component
    })
}

module.exports = {
  compileDocument,
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

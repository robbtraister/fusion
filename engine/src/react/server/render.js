#!/usr/bin/env node

'use strict'

const debugTimer = require('debug')('fusion:timer:react:render')

const React = require('react')
const ReactDOM = require('react-dom/server')

const compileComponent = require('./compile/component')
const Provider = require('./provider')

const timer = require('../../timer')

const {
  compileOne
} = require('../../scripts/compile')

const {
  fetchFile
} = require('../../scripts/io')

const {
  getOutputType
} = require('../../scripts/info')

const {
  componentDistRoot,
  prefix,
  onDemand,
  version
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
    src: `/${prefix}/dist/engine/react.js?v=${version}`,
    defer: true
  }
)
const componentsScript = React.createElement(
  'script',
  {
    key: 'components',
    type: 'application/javascript',
    src: `/${prefix}/dist/components/all.js?v=${version}`,
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
    `Fusion.prefix='${prefix}';` +
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
      const inlines = Component.inlines || {}
      const contentCache = Component.contentCache || {}
      const contentPromises = [].concat(
        Object.keys(inlines)
          .map(inline => inlines[inline].fetched),
        ...Object.keys(contentCache)
          .map(source => {
            const sourceCache = contentCache[source]
            return Object.keys(sourceCache).map(key => sourceCache[key].fetched)
          })
      )

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

const compileRenderable = function compileRenderable ({renderable, outputType}) {
  let tic = timer.tic()
  return Promise.resolve(compileComponent(renderable, outputType))
    .then(Feature => {
      debugTimer(`compile(${renderable._id || renderable.id})`, tic.toc())
      tic = timer.tic()
      return Provider(Feature)
    })
    .then((Component) => {
      debugTimer('provider wrapping', tic.toc())
      return Component
    })
}

const compileDocument = function compileDocument ({renderable, outputType, name}) {
  outputType = getOutputType(outputType)
  let tic
  return compileRenderable({renderable, outputType})
    .then((Template) => {
      tic = timer.tic()

      const OutputType = (() => {
        try {
          return require(`${componentDistRoot}/output-types/${outputType}`)
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
             *   {props.metaTag}
             *   {props.metaTag()}
             *
             * To select a single meta tag
             *   {props.metaTag('title')}
             *   {props.metaTag({name: 'title'})}
             */
            metaTag: propFunction(function (name, defaultValue) {
              if (typeof name === 'object') {
                name = name.name
                defaultValue = name.default || defaultValue
              }

              const metas = (renderable.meta || {})

              const getElement = (name) => metas[name]
                ? React.createElement(
                  'meta',
                  {
                    key: `meta-${name}`,
                    name,
                    content: metas[name].value || defaultValue
                  }
                )
                : null

              return (name)
                ? getElement(name)
                : Object.keys(metas).filter(name => metas[name].html).map(getElement)
            }),
            /*
             * Each of the following are equivalent in JSX
             * To select a single meta tag
             *   {props.metaValue('title')}
             *   {props.metaValue({name: 'title'})}
             */
            metaValue: propFunction(function (name) {
              if (typeof name === 'object') {
                name = name.name
              }

              const metas = (renderable.meta || {})
              return name && metas[name] && metas[name].value
            }),
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
                  src: `/${prefix}/dist/${name}/${outputType}.js?v=${version}${useComponentLib ? '&useComponentLib=true' : ''}`,
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
             *   {props.css}
             *   {props.css()}
             *   {props.css(false)}
             *   {props.css({inline: false})}
             *
             * To inline the css
             * (larger payload, bad for cache; suitable for AMP)
             *   {props.css(true)}
             *   {props.css({inline: true})}
             */
            css: propFunction(function (inline) {
              if (typeof inline === 'object') {
                inline = inline.inline
              }
              inline = (inline === undefined) ? false : !!inline

              if (renderable.css === undefined || renderable.css[outputType] === undefined) {
                // these assets have yet to be compiled
                // use the inlines promise to wait for compilation and make the css hash file available
                // this should only happen in development
                Component.inlines.styles = Component.inlines.styles || {
                  cached: undefined,
                  fetched: compileOne({name, rendering: renderable, outputType})
                    .then(({css, cssFile}) => {
                      Component.inlines.styles.cached = css
                    })
                }
              } else if (inline && renderable.css && renderable.css[outputType]) {
                // these assets have been compiled
                // read the css file to be inserted inline
                Component.inlines.styles = Component.inlines.styles || {
                  cached: undefined,
                  fetched: fetchFile(renderable.css[outputType])
                    .then((css) => {
                      Component.inlines.styles.cached = css
                    })
                }
              }

              return (!inline)
                // even if cssFile is null, add the link tag with no href
                // so it can be replaced by an updated template script later
                ? React.createElement(
                  'link',
                  {
                    key: 'template-style',
                    id: 'template-style',
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: (renderable.css && renderable.css[outputType]) ? `/${prefix}/dist/${renderable.css[outputType]}` : null
                  }
                )
                : (Component.inlines.styles.cached)
                  ? React.createElement(
                    'style',
                    {},
                    Component.inlines.styles.cached
                  )
                  : null
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
            }),
            ...props
          },
          React.createElement(
            Template,
            // pass down the original props
            props
          )
        )
      }

      Component.inlines = Template.inlines
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

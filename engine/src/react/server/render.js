#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const debugTimer = require('debug')('fusion:timer:react:render')

const React = require('react')
const ReactDOM = require('react-dom/server')

const compileComponent = require('./compile/component')
const Provider = require('./provider')

const unpack = require('../../utils/unpack')

const timer = require('../../timer')

const fusionProperties = require('fusion:properties')

const getTree = require('../shared/compile/tree')

const {
  fetchFile
} = require('../../io')

const {
  componentDistRoot,
  contextPath,
  isDev,
  version
} = require('../../../environment')

const { components } = require('../../../environment/manifest')

const { sendMetrics, METRIC_TYPES } = require('../../utils/send-metrics')

const fileExists = (fp) => {
  try {
    fs.accessSync(fp, fs.constants.R_OK)
    return true
  } catch (e) {
    return false
  }
}

const outputTypeCssFileExists = (outputType) => fileExists(path.resolve(componentDistRoot, 'output-types', `${outputType}.css`))
const outputTypeHasCss = (isDev)
  // don't cache it in dev because it might change
  ? outputTypeCssFileExists
  // cache it in prod because it won't change
  : (() => {
    const _outputTypeHasCss = {}
    return (outputType) => {
      if (!_outputTypeHasCss.hasOwnProperty(outputType)) {
        _outputTypeHasCss[outputType] = outputTypeCssFileExists(outputType)
      }
      return _outputTypeHasCss[outputType]
    }
  })()

// this wrapper allows a function to be used in JSX without parentheses
// use `{props.scripts}` to execute the function with the defaults
// use `{props.scripts(true)}` to execute the function with custom inputs
function propFunction (fn) {
  fn[Symbol.iterator] = function * () {
    yield fn()
  }
  return fn
}

const engineScript = React.createElement(
  'script',
  {
    key: 'fusion-engine-script',
    id: 'fusion-engine-script',
    type: 'application/javascript',
    src: `${contextPath}/dist/engine/react.js?v=${version}`,
    defer: true
  }
)

function escapeContent (content) {
  return JSON.stringify(content).replace(/<\/script>/g, '<\\/script>')
}

function getFusionScript (globalContent, globalContentConfig, contentCache, outputType, arcSite) {
  const now = +new Date()
  const condensedCache = {}
  Object.keys(contentCache)
    .forEach(sourceName => {
      const sourceCache = contentCache[sourceName]
      Object.keys(sourceCache)
        .forEach(key => {
          const keyCache = sourceCache[key]
          if (keyCache.source && keyCache.filtered) {
            const condensedSourceCache = condensedCache[sourceName] = condensedCache[sourceName] || {
              entries: {},
              expiresAt: now + ((keyCache.source && keyCache.source.ttl) || 300000)
            }
            condensedSourceCache.entries[key] = {cached: keyCache.filtered}
          }
        })
    })

  return `window.Fusion=window.Fusion||{};` +
    `Fusion.contextPath='${contextPath}';` +
    `Fusion.outputType='${outputType}';` +
    (arcSite ? `Fusion.arcSite='${arcSite}';` : '') +
    `Fusion.lastModified=${now};` +
    `Fusion.globalContent=${escapeContent(globalContent || {})};` +
    `Fusion.globalContentConfig=${escapeContent(globalContentConfig || {})};` +
    `Fusion.contentCache=${escapeContent(condensedCache)}`
}

const getAncestors = function getAncestors (node) {
  return (node && node.children)
    ? node.children
      .concat(...node.children.map(getAncestors))
    : []
}

const render = function render ({Component, request, content, _website}) {
  const renderHTML = () => new Promise((resolve, reject) => {
    try {
      const elementTic = timer.tic()
      const element = React.createElement(
        Component,
        {
          arcSite: _website,
          contextPath,
          globalContent: content ? content.document : null,
          globalContentConfig: content ? {source: content.source, key: content.key} : null,
          outputType: Component.outputType,
          requestUri: request && request.uri,
          siteProperties: fusionProperties(_website)
        }
      )
      const elementElapsedTime = elementTic.toc()
      debugTimer(`create element`, elementElapsedTime)
      sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: elementElapsedTime, tags: ['render:element']}])
      const htmlTic = timer.tic()
      const html = ReactDOM.renderToStaticMarkup(element)
      const htmlElapsedTime = htmlTic.toc()
      debugTimer(`render html`, htmlElapsedTime)
      sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: htmlElapsedTime, tags: ['render:html']}])
      resolve(html)
    } catch (e) {
      sendMetrics([{type: METRIC_TYPES.RENDER_RESULT, value: 1, tags: ['result:error']}])
      reject(e)
    }
  })

  let tic = timer.tic()
  return renderHTML()
    .then((html) => {
      const elapsedTime = tic.toc()
      debugTimer('first render', elapsedTime)
      sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: elapsedTime, tags: ['render:first-render']}])
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

      const htmlPromise = (contentPromises.length === 0)
        // if no feature content is requested, return original rendering
        ? Promise.resolve(html)
        // if feature content is requested, wait for it, then render again
        : Promise.all(contentPromises)
          .then(() => {
            const contentHydrationDuration = tic.toc()
            debugTimer('content hydration', contentHydrationDuration)
            sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: contentHydrationDuration, tags: ['render:content-hydration']}])
            tic = timer.tic()
          })
          .then(renderHTML)
          .then((html) => {
            const secondRenderDuration = tic.toc()
            debugTimer('second render', secondRenderDuration)
            sendMetrics([{type: METRIC_TYPES.RENDER_DURATION, value: secondRenderDuration, tags: ['render:second-render']}])
            return html
          })

      return htmlPromise
        .then(html => (Component.transform)
          ? Component.transform(html)
          : html
        )
    })
}

const compileRenderable = function compileRenderable ({renderable, outputType}) {
  if (isDev) {
    // clear cache to ensure we load the latest
    Object.keys(require.cache)
      .filter((fp) => fp.startsWith(componentDistRoot))
      .forEach((fp) => { delete require.cache[fp] })
  }

  let tic = timer.tic()
  const tree = getTree(renderable)
  return Promise.resolve(compileComponent(renderable, outputType))
    .then((Renderable) => {
      debugTimer(`compile(${renderable._id || renderable.id})`, tic.toc())
      tic = timer.tic()
      return Provider(Renderable)
    })
    .then((Component) => {
      Component.tree = tree
      debugTimer('provider wrapping', tic.toc())
      return Component
    })
}

const getOutputTypeComponent = function getOutputTypeComponent (outputType) {
  try {
    return unpack(require(components.outputTypes[outputType].dist))
  } catch (e) {
    const err = new Error(`Could not find output-type: ${outputType}`)
    err.statusCode = 400
    throw err
  }
}

const compileDocument = function compileDocument ({rendering, outputType, name}) {
  let tic
  return rendering.getJson()
    .then((json) => {
      return compileRenderable({renderable: json, outputType})
        .then((Template) => {
          if (!outputType) {
            return Template
          }

          tic = timer.tic()

          const OutputType = getOutputTypeComponent(outputType)

          const Component = (props) => {
            return React.createElement(
              OutputType,
              {
                contextPath,
                version,
                tree: Template.tree,
                renderables: [Template.tree].concat(...getAncestors(Template.tree)),
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

                  const metas = (json.meta || {})

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

                  const metas = (json.meta || {})
                  return name && metas[name] && metas[name].value
                }),
                /*
                 * Each of the following are equivalent in JSX
                 *   {props.libs}
                 *   {props.libs()}
                 */
                libs: propFunction(function () {
                  const templateScript = React.createElement(
                    'script',
                    {
                      key: 'fusion-template-script',
                      id: 'fusion-template-script',
                      type: 'application/javascript',
                      src: `${contextPath}/dist/${name}/${outputType}.js?v=${version}`,
                      defer: true
                    }
                  )

                  return [
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
                styles: propFunction(function (cb) {
                  const outputTypeStylesPromise = fetchFile(`components/output-types/${outputType}.css`)
                    .catch(() => null)

                  const templateStylesPromise = rendering.getStyles()
                    .catch(() => null)

                  Component.inlines.styles = Component.inlines.styles || {
                    cached: {
                      outputTypeStyles: undefined,
                      templateStyles: undefined
                    },
                    fetched: Promise.all([
                      outputTypeStylesPromise,
                      templateStylesPromise
                    ])
                      .then(([outputTypeStyles, templateStyles]) => {
                        Component.inlines.styles.cached = {
                          outputTypeStyles,
                          templateStyles
                        }
                      })
                  }

                  return (cb)
                    ? cb(Component.inlines.styles.cached)
                    : React.createElement(
                      'style',
                      {
                        dangerouslySetInnerHTML: { __html: `${Component.inlines.styles.cached.outputTypeStyles || ''}${Component.inlines.styles.cached.templateStyles || ''}` }
                      }
                    )
                }),
                /*
                 * Each of the following are equivalent in JSX
                 *   {props.cssLinks}
                 *   {props.cssLinks()}
                 */
                cssLinks: propFunction(function (cb) {
                  Component.inlines.cssLinks = Component.inlines.cssLinks || {
                    cached: {
                      outputTypeHref: undefined,
                      templateHref: undefined
                    },
                    fetched: rendering.getCssFile()
                      .catch(() => null)
                      .then((templateCssFile) => {
                        Component.inlines.cssLinks.cached = {
                          outputTypeHref: (outputTypeHasCss(outputType)) ? `${contextPath}/dist/components/output-types/${outputType}.css?v=${version}` : null,
                          templateHref: (templateCssFile) ? `${contextPath}/dist/${templateCssFile}?v=${version}` : null
                        }
                      })
                  }

                  return (cb)
                    ? cb(Component.inlines.cssLinks.cached)
                    // even if cssFile is null, add the link tag with no href
                    // so it can be replaced by an updated template script later
                    : [
                      (Component.inlines.cssLinks.cached.outputTypeHref)
                        ? React.createElement(
                          'link',
                          {
                            key: 'fusion-output-type-styles',
                            id: 'fusion-output-type-styles',
                            rel: 'stylesheet',
                            type: 'text/css',
                            href: Component.inlines.cssLinks.cached.outputTypeHref
                          }
                        )
                        : null,
                      React.createElement(
                        'link',
                        {
                          key: 'fusion-template-styles',
                          id: 'fusion-template-styles',
                          rel: 'stylesheet',
                          type: 'text/css',
                          href: Component.inlines.cssLinks.cached.templateHref
                        }
                      )
                    ]
                }),
                /*
                 * Each of the following are equivalent in JSX
                 *   {props.fusion}
                 *   {props.fusion()}
                 */
                fusion: propFunction(function () {
                  return React.createElement(
                    'script',
                    {
                      type: 'application/javascript',
                      dangerouslySetInnerHTML: { __html: getFusionScript(props.globalContent, props.globalContentConfig, Template.contentCache, outputType, props.arcSite) }
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
          Component.transform = OutputType.transform
          debugTimer('output-type wrapping', tic.toc())
          return Component
        })
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

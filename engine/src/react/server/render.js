#!/usr/bin/env node

'use strict'

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
  cssTagGenerator,
  fusionTagGenerator,
  libsTagGenerator,
  metaTagGenerator,
  stylesGenerator
} = require('./tags')

const {
  componentDistRoot,
  contextPath,
  isDev,
  version
} = require('../../../environment')

const { components } = require('../../../environment/manifest')

const { sendMetrics, METRIC_TYPES } = require('../../utils/send-metrics')

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
  return Promise.resolve(compileComponent(renderable, outputType))
    .then((Renderable) => {
      debugTimer(`compile(${renderable._id || renderable.id})`, tic.toc())
      tic = timer.tic()
      return Provider(Renderable)
    })
    .then((Component) => {
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

          const tree = getTree(json)

          const metas = (json.meta || {})

          const getMetaTag = metaTagGenerator(metas)

          const MetaTags = () =>
            Object.keys(metas).filter(name => metas[name].html).map(getMetaTag)

          const CssTags = cssTagGenerator({inlines: Template.inlines, rendering, outputType})

          const Component = (props) => {
            return React.createElement(
              OutputType,
              {
                contextPath,
                version,
                tree,
                renderables: [tree].concat(...getAncestors(tree)),

                CssLinks: CssTags,
                CssTags,

                Fusion: fusionTagGenerator(props.globalContent, props.globalContentConfig, Template.contentCache, outputType, props.arcSite),
                Libs: libsTagGenerator({name, outputType}),

                /*
                 * To insert all meta tags
                 *   <props.MetaTag />
                 *   <props.MetaTags />
                 *
                 * To insert a single meta tag
                 *   <props.MetaTag name='title' />
                 */
                MetaTag ({name, default: defaultValue}) {
                  return (name)
                    ? getMetaTag(name)
                    : MetaTags()
                },
                MetaTags,
                metaValue (nameOrObject, defaultValue) {
                  const isObject = typeof nameOrObject === 'object'

                  const name = (isObject)
                    ? nameOrObject.name
                    : nameOrObject

                  return (name && metas[name] && metas[name].value) ||
                    (isObject ? nameOrObject.default : defaultValue)
                },

                Styles: stylesGenerator({inlines: Template.inlines, outputType, rendering}),

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

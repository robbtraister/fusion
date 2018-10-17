#!/usr/bin/env node

'use strict'

const path = require('path')

const debugTimer = require('debug')('fusion:timer:react:render')

const React = require('react')
const ReactDOM = require('react-dom/server')

const compileStandardComponent = require('./compile/component')
const compileQuarantineComponent = require('./compile/quarantine')

const Provider = require('./provider')

const unpack = require('../../utils/unpack')

const timer = require('../../timer')

const fusionProperties = require('fusion:properties')

const {
  cssTagGenerator,
  deployment,
  fusionTagGenerator,
  libsTagGenerator,
  metaTagGenerator,
  stylesGenerator
} = require('./tags')

const {
  bundleRoot,
  componentDistRoot,
  contextPath,
  isDev
} = require('../../../environment')

const { components } = require('../../../manifest')

const { sendMetrics, METRIC_TYPES } = require('../../utils/send-metrics')

const getAncestors = function getAncestors (node) {
  return (node && node.children)
    ? node.children
      .concat(...node.children.map(getAncestors))
    : []
}

const render = async function render ({ Component, request, content }) {
  const renderHTML = async () => {
    try {
      const elementTic = timer.tic()
      const element = React.createElement(
        Component,
        {
          arcSite: request.arcSite,
          contextPath,
          globalContent: content ? content.document : null,
          globalContentConfig: content ? { source: content.source, key: content.key } : null,
          outputType: Component.outputType,
          requestUri: request.uri,
          siteProperties: fusionProperties(request.arcSite)
        }
      )
      const elementElapsedTime = elementTic.toc()
      debugTimer(`create element`, elementElapsedTime)
      sendMetrics([{ type: METRIC_TYPES.RENDER_DURATION, value: elementElapsedTime, tags: ['render:element'] }])
      const htmlTic = timer.tic()
      const html = ReactDOM.renderToStaticMarkup(element)
      const htmlElapsedTime = htmlTic.toc()
      debugTimer(`render html`, htmlElapsedTime)
      sendMetrics([{ type: METRIC_TYPES.RENDER_DURATION, value: htmlElapsedTime, tags: ['render:html'] }])
      return html
    } catch (e) {
      sendMetrics([{ type: METRIC_TYPES.RENDER_RESULT, value: 1, tags: ['result:error'] }])
      throw e
    }
  }

  let tic = timer.tic()
  let html = await renderHTML()
  const elapsedTime = tic.toc()
  debugTimer('first render', elapsedTime)
  sendMetrics([{ type: METRIC_TYPES.RENDER_DURATION, value: elapsedTime, tags: ['render:first-render'] }])
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

  if (contentPromises.length > 0) {
    await Promise.all(contentPromises)
    const contentHydrationDuration = tic.toc()
    debugTimer('content hydration', contentHydrationDuration)
    sendMetrics([{ type: METRIC_TYPES.RENDER_DURATION, value: contentHydrationDuration, tags: ['render:content-hydration'] }])
    tic = timer.tic()

    html = renderHTML()
    const secondRenderDuration = tic.toc()
    debugTimer('second render', secondRenderDuration)
    sendMetrics([{ type: METRIC_TYPES.RENDER_DURATION, value: secondRenderDuration, tags: ['render:second-render'] }])
  }

  return (Component.transform)
    ? Component.transform(html)
    : html
}

const getOutputTypeComponent = function getOutputTypeComponent (outputType) {
  try {
    return unpack(require(path.join(bundleRoot, components.outputTypes[outputType].dist)))
  } catch (e) {
    const err = new Error(`Could not find output-type: ${outputType}`)
    err.statusCode = 400
    throw err
  }
}

const compileRenderable = async function compileRenderable ({ renderable, outputType, quarantine, inlines, contentCache }) {
  if (isDev) {
    // clear cache to ensure we load the latest
    Object.keys(require.cache)
      .filter((fp) => fp.startsWith(componentDistRoot))
      .forEach((fp) => { delete require.cache[fp] })
  }

  let tic = timer.tic()
  const compileFn = (quarantine)
    ? compileQuarantineComponent
    : compileStandardComponent

  const Renderable = await compileFn(renderable, outputType)
  debugTimer(`compile(${renderable._id || renderable.id})`, tic.toc())
  tic = timer.tic()
  const Component = await Provider(Renderable, inlines, contentCache)
  debugTimer('provider wrapping', tic.toc())
  return Component
}

const compileDocument = async function compileDocument ({ name, rendering, outputType, inlines, contentCache, isAdmin, quarantine }) {
  let tic
  const json = await rendering.getJson()
  const Template = await compileRenderable({ renderable: json, outputType, inlines, contentCache, isAdmin, quarantine })
  if (!outputType) {
    return Template
  }

  tic = timer.tic()

  const OutputType = getOutputTypeComponent(outputType)

  const metas = (json.meta || {})

  const getMetaTag = metaTagGenerator(metas)

  const MetaTags = () =>
    Object.keys(metas).filter(name => metas[name].html).map(getMetaTag)

  const CssTags = (isAdmin)
    ? () => null
    : cssTagGenerator({ inlines: Template.inlines, rendering, outputType })

  const Component = (props) => {
    return React.createElement(
      OutputType,
      {
        contextPath,
        deployment,
        version: deployment,
        tree: Template.tree,
        renderables: [Template.tree].concat(...getAncestors(Template.tree)),

        CssLinks: CssTags,
        CssTags,

        Fusion: fusionTagGenerator(props.globalContent, props.globalContentConfig, Template.contentCache, outputType, props.arcSite),
        Libs: (isAdmin)
          ? () => null
          : libsTagGenerator({ name, outputType }),

        /*
         * To insert all meta tags
         *   <props.MetaTag />
         *   <props.MetaTags />
         *
         * To insert a single meta tag
         *   <props.MetaTag name='title' />
         */
        MetaTag ({ name, default: defaultValue }) {
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

        Styles: (isAdmin)
          ? () => null
          : stylesGenerator({ inlines: Template.inlines, outputType, rendering }),

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
    .then((rendering) => render({ template: rendering }))
    .then(console.log)
    .catch(console.error)
}

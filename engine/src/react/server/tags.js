'use strict'

const React = require('react')

const fs = require('fs')
const path = require('path')

const {
  fetchAsset
} = require('../../io')

const {
  componentDistRoot,
  contextPath,
  isDev,
  version
} = require('../../../environment')

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

function escapeScriptContent (content) {
  return JSON.stringify(content).replace(/<\/script>/g, '<\\/script>')
}

function fileExists (fp) {
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
    const outputTypeHasCssCache = {}
    return (outputType) => {
      if (!outputTypeHasCssCache.hasOwnProperty(outputType)) {
        outputTypeHasCssCache[outputType] = outputTypeCssFileExists(outputType)
      }
      return outputTypeHasCssCache[outputType]
    }
  })()

const cssTagGenerator = ({inlines, rendering, outputType}) => {
  inlines.cssLinks = inlines.cssLinks || {
    cached: {
      outputTypeHref: undefined,
      templateHref: undefined
    },
    fetched: rendering.getCssFile()
      .catch(() => null)
      .then((templateCssFile) => {
        inlines.cssLinks.cached = {
          outputTypeHref: (outputTypeHasCss(outputType)) ? `${contextPath}/dist/components/output-types/${outputType}.css?v=${version}` : null,
          templateHref: (templateCssFile) ? `${contextPath}/dist/${templateCssFile}?v=${version}` : null
        }
      })
  }

  return ({children}) => (children)
    ? children(inlines.styles.cached)
    // even if cssFile is null, add the link tag with no href
    // so it can be replaced by an updated template script later
    : [
      (inlines.cssLinks.cached.outputTypeHref)
        ? React.createElement(
          'link',
          {
            key: 'fusion-output-type-styles',
            id: 'fusion-output-type-styles',
            rel: 'stylesheet',
            type: 'text/css',
            href: inlines.cssLinks.cached.outputTypeHref
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
          href: inlines.cssLinks.cached.templateHref
        }
      )
    ]
}

const fusionTagGenerator = (globalContent, globalContentConfig, contentCache, outputType, arcSite) => {
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

  const __html = `window.Fusion=window.Fusion||{};` +
    `Fusion.contextPath='${contextPath}';` +
    `Fusion.outputType='${outputType}';` +
    (arcSite ? `Fusion.arcSite='${arcSite}';` : '') +
    `Fusion.lastModified=${now};` +
    `Fusion.globalContent=${escapeScriptContent(globalContent || {})};` +
    `Fusion.globalContentConfig=${escapeScriptContent(globalContentConfig || {})};` +
    `Fusion.contentCache=${escapeScriptContent(condensedCache)}`

  return () => React.createElement(
    'script',
    {
      type: 'application/javascript',
      dangerouslySetInnerHTML: { __html }
    }
  )
}

const libsTagGenerator = ({name, outputType}) => {
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

  return () => React.createElement(
    React.Fragment,
    {},
    [
      engineScript,
      templateScript
    ]
  )
}

const metaTagGenerator = (metas = {}) => (name, defaultValue) =>
  (metas[name])
    ? React.createElement(
      'meta',
      {
        key: `meta-${name}`,
        name,
        content: metas[name].value || defaultValue
      }
    )
    : null

const stylesGenerator = ({inlines, rendering, outputType}) => {
  const outputTypeStylesPromise = fetchAsset(`components/output-types/${outputType}.css`)
    .catch(() => null)

  const templateStylesPromise = rendering.getStyles()
    .catch(() => null)

  inlines.styles = inlines.styles || {
    cached: {
      outputTypeStyles: undefined,
      templateStyles: undefined
    },
    fetched: Promise.all([
      outputTypeStylesPromise,
      templateStylesPromise
    ])
      .then(([outputTypeStyles, templateStyles]) => {
        inlines.styles.cached = {
          outputTypeStyles,
          templateStyles
        }
      })
  }

  return ({children}) => (children)
    ? children(inlines.styles.cached)
    : React.createElement(
      'style',
      {
        dangerouslySetInnerHTML: { __html: `${inlines.styles.cached.outputTypeStyles || ''}${inlines.styles.cached.templateStyles || ''}` }
      }
    )
}

module.exports = {
  cssTagGenerator,
  fusionTagGenerator,
  libsTagGenerator,
  metaTagGenerator,
  stylesGenerator
}

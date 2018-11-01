'use strict'

const React = require('react')

const fs = require('fs')
const path = require('path')

const {
  readFile
} = require('../../utils/promises')

const {
  componentDistRoot,
  contextPath,
  deployment,
  deploymentWrapper,
  isDev
} = require('../../../environment')

const polyfillSrc = deploymentWrapper(`${contextPath}/dist/engine/polyfill.js`)
const polyfillChecks = [
  '!Array.prototype.includes',
  '!(window.Object && window.Object.assign)',
  '!window.Promise',
  '!window.fetch'
]
const polyfillHtml = `if(${polyfillChecks.join('||')}){document.write('<script type="application/javascript" src="${polyfillSrc}" defer=""><\\/script>')}`
const polyfillScript = (polyfillChecks.length)
  ? React.createElement(
    'script',
    {
      key: 'fusion-polyfill-script',
      type: 'application/javascript',
      dangerouslySetInnerHTML: {
        __html: polyfillHtml
      }
    }
  )
  : null

const engineScript = React.createElement(
  'script',
  {
    key: 'fusion-engine-script',
    id: 'fusion-engine-script',
    type: 'application/javascript',
    src: deploymentWrapper(`${contextPath}/dist/engine/react.js`),
    defer: true
  }
)

function fileExists (fp) {
  try {
    fs.accessSync(fp, fs.constants.R_OK)
    return true
  } catch (e) {
    return false
  }
}

const outputTypeCssFile = (outputType) => path.resolve(componentDistRoot, 'output-types', `${outputType}.css`)
const outputTypeCssFileExists = (outputType) => fileExists(outputTypeCssFile(outputType))
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

const cssTagGenerator = ({ inlines, rendering, outputType }) => {
  inlines.cssLinks = inlines.cssLinks || {
    cached: {
      outputTypeHref: undefined,
      templateHref: undefined
    },
    fetched: rendering.getCssFile()
      .catch(() => null)
      .then((templateCssFile) => {
        inlines.cssLinks.cached = {
          outputTypeHref: (outputTypeHasCss(outputType)) ? deploymentWrapper(`${contextPath}/dist/components/output-types/${outputType}.css`) : null,
          templateHref: (templateCssFile) ? deploymentWrapper(`${contextPath}/dist/${templateCssFile}`) : null
        }
      })
  }

  return ({ children }) => (children)
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

function escapeScriptContent (content) {
  return JSON.stringify(content).replace(/<\/script>/g, '<\\/script>')
}

const fusionTagGenerator = (globalContent, globalContentConfig, contentCache, outputType, arcSite) => {
  const now = +new Date()
  const condensedCache = {}
  Object.keys(contentCache)
    .forEach(sourceName => {
      const sourceCache = contentCache[sourceName]
      Object.keys(sourceCache)
        .forEach(queryString => {
          const queryCache = sourceCache[queryString]
          if (queryCache.source && queryCache.filtered) {
            const condensedSourceCache = condensedCache[sourceName] = condensedCache[sourceName] || {
              entries: {},
              expiresAt: now + ((queryCache.source && queryCache.source.ttl()) || 300) * 1000
            }
            condensedSourceCache.entries[queryString] = { cached: queryCache.filtered }
          }
        })
    })

  const __html = `window.Fusion=window.Fusion||{};` +
    `Fusion.contextPath='${contextPath}';` +
    `Fusion.deployment='${deployment}';` +
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

const libsTagGenerator = ({ name, outputType }) => {
  const templateScript = React.createElement(
    'script',
    {
      key: 'fusion-template-script',
      id: 'fusion-template-script',
      type: 'application/javascript',
      src: deploymentWrapper(`${contextPath}/dist/${name}/${outputType}.js`),
      defer: true
    }
  )

  return () => React.createElement(
    React.Fragment,
    {},
    [
      polyfillScript,
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

const stylesGenerator = ({ inlines, rendering, outputType }) => ({ children }) => {
  const outputTypeStylesPromise = readFile(outputTypeCssFile(outputType))
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

  return (children)
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
  deploymentWrapper,
  fusionTagGenerator,
  libsTagGenerator,
  metaTagGenerator,
  stylesGenerator
}

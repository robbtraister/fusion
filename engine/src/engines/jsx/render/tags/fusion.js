'use strict'

const React = require('react')

function escapeScriptContent (content) {
  return JSON.stringify(content).replace(/<\/script>/g, '<\\/script>')
}

module.exports = (context) => {
  const { contentCache, props } = context

  const {
    arcSite,
    // contextPath,
    // deployment,
    globalContent,
    globalContentConfig
    // outputType
  } = props

  return {
    Fusion () {
      const now = +new Date()
      const condensedCache = {}
      Object.keys(contentCache)
        .forEach(sourceName => {
          const sourceCache = contentCache[sourceName]
          Object.keys(sourceCache)
            .forEach(queryString => {
              const queryCache = sourceCache[queryString]
              if (queryCache.source && queryCache.filtered) {
                const condensedSourceCache = condensedCache[sourceName] = condensedCache[sourceName] || {}
                condensedSourceCache[queryString] = {
                  data: queryCache.filtered,
                  expires: queryCache.expires,
                  lastModified: queryCache.lastModified
                }
              }
            })
        })

      const __html = `window.Fusion=window.Fusion||{};` +
        // `Fusion.contextPath='${contextPath}';` +
        // `Fusion.deployment='${deployment}';` +
        // `Fusion.outputType='${outputType}';` +
        (arcSite ? `Fusion.arcSite='${arcSite}';` : '') +
        `Fusion.lastModified=${now};` +
        `Fusion.globalContent=${escapeScriptContent(globalContent || {})};` +
        `Fusion.globalContentConfig=${escapeScriptContent(globalContentConfig || {})};` +
        `Fusion.contentCache=${escapeScriptContent(condensedCache)}`

      return React.createElement(
        'script',
        {
          type: 'application/javascript',
          dangerouslySetInnerHTML: { __html }
        }
      )
    }
  }
}

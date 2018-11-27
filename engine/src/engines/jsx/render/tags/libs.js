'use strict'

const React = require('react')

const polyfillChecks = [
  '!Array.prototype.includes',
  '!(window.Object && window.Object.assign)',
  '!window.Promise',
  '!window.fetch'
]

module.exports = (context) => {
  const { props } = context

  const {
    contextPath,
    deployment,
    isAdmin,
    outputType,
    rendering
  } = props

  const polyfillSrc = deployment(`${contextPath}/dist/engine/polyfill.js`)
  const polyfillHtml = `if(${polyfillChecks.join('||')}){` +
    `document.write('<script type="application/javascript" src="${polyfillSrc}" defer=""><\\/script>')` +
    `}`

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

  const engineScriptTag = React.createElement(
    'script',
    {
      key: 'fusion-engine-script',
      id: 'fusion-engine-script',
      type: 'application/javascript',
      src: deployment(`${contextPath}/dist/engine/react.js`),
      defer: true
    }
  )

  const templateScriptTag = (rendering)
    ? React.createElement(
      'script',
      {
        key: 'fusion-template-script',
        id: 'fusion-template-script',
        type: 'application/javascript',
        src: deployment(`${contextPath}/dist/${rendering.type}/${rendering.id}/${outputType}.js`),
        defer: true
      }
    )
    : null

  return {
    Libs () {
      return (isAdmin)
        ? polyfillScript
        : React.createElement(
          React.Fragment,
          {},
          [
            polyfillScript,
            engineScriptTag,
            templateScriptTag
          ]
        )
    }
  }
}

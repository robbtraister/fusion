'use strict'

const React = require('react')

module.exports = context => props => {
  const __html =
    'window.Fusion=window.Fusion||{};' +
    `Fusion.layout=${JSON.stringify(
      context.tree && context.tree.collection === 'layouts'
        ? context.tree.type
        : undefined
    )};` +
    `Fusion.outputType=${JSON.stringify(context.outputType)};` +
    `Fusion.template=${JSON.stringify(context.template)};` +
    `Fusion.tree=${JSON.stringify(context.tree)};`

  return React.createElement(
    'script',
    {
      dangerouslySetInnerHTML: { __html }
    }
  )
}

'use strict'

const React = require('react')

module.exports = context => props => {
  const __html =
    'window.Fusion=window.Fusion||{};'

  return React.createElement(
    'script',
    {
      dangerouslySetInnerHTML: { __html }
    }
  )
}

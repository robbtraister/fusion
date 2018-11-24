'use strict'

/* global Fusion */

const React = require('react')

const StaticComponent = (props) => {
  const html = Fusion.elementCache[props.id]
  return (html)
    ? React.createElement(
      'div',
      {
        key: props.id,
        id: props.id,
        className: 'fusion:static',
        dangerouslySetInnerHTML: { __html: html }
      }
    )
    : null
}

module.exports = StaticComponent

'use strict'

/* global Fusion */

const React = require('react')

const Context = (props) => {
  const children = (props.children instanceof Array)
    ? props.children
    : [props.children]

  return React.createElement(
    Fusion.context.Consumer,
    {},
    (context) =>
      children.map(
        (child, index) =>
          React.createElement(
            child,
            {
              key: index,
              ...context.props,
              ...props
            }
          )
      )
  )
}

module.exports = Context

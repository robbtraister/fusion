'use strict'

/* global Fusion */

const React = require('react')

const Context = ({ children: Child, ...props }) =>
  React.createElement(
    Fusion.context.Consumer,
    {},
    ({ props: contextProps }) =>
      React.createElement(
        Child,
        { ...contextProps, ...props }
      )
  )

module.exports = Context

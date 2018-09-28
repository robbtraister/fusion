'use strict'

const React = require('react')

const Consumer = require('./consumer')

const Context = ({ children }) =>
  React.createElement(
    Consumer(
      ({ contentEditable, eventListeners, getContent, children: _, ...context }) =>
        children(context)
    )
  )

module.exports = Context

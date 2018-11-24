'use strict'

const React = require('react')

module.exports = ({ message, ...props }) =>
  React.createElement(
    'div',
    {
      'data-fusion-message': message,
      style: {
        display: 'none'
      },
      ...props
    }
  )

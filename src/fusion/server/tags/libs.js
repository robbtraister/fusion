'use strict'

const PropTypes = require('prop-types')
const React = require('react')

const Script = ({ id, src }) =>
  React.createElement('script', {
    id,
    key: id,
    src,
    defer: 'defer'
  })

Script.propTypes = {
  id: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired
}

module.exports = context => props => [
  React.createElement(Script, {
    id: 'fusion-runtime-script',
    src: '/dist/runtime.js'
  }),
  React.createElement(Script, {
    id: 'fusion-engine-script',
    src: '/dist/engine.js'
  }),
  React.createElement(Script, {
    id: 'fusion-template-script',
    src: `/dist/templates/${context.template}/${context.outputType}.js`
  })
]

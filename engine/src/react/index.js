'use strict'

const mockRequire = require('mock-require')
const FusionPropTypes = require('./shared/prop-types')
mockRequire('PropTypes', FusionPropTypes)
mockRequire('prop-types', FusionPropTypes)

const clientEntries = {
  admin: require.resolve('./client/admin'),
  react: require.resolve('./client')
}

const {
  compileDocument,
  compileRenderable,
  render
} = require('./server/render')

const generateSource = require('./server/compile/source')

module.exports = {
  clientEntries,
  compileDocument,
  compileRenderable,
  generateSource,
  render
}

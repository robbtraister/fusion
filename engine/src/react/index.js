'use strict'

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

'use strict'

const {
  compileDocument,
  compileRenderable,
  render
} = require('./server/render')

const generateSource = require('./server/compile/source')

module.exports = {
  compileDocument,
  compileRenderable,
  generateSource,
  render
}

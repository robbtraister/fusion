'use strict'

const {
  compileDocument,
  compileRenderable,
  render
} = require('./server/render')

const generateSource = require('./shared/compile/source')

module.exports = {
  compileDocument,
  compileRenderable,
  generateSource,
  render
}

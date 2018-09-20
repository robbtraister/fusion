'use strict'

const ComponentCompiler = require('../../shared/compile/component')

const loadComponent = require('./load-component')

class ServerCompiler extends ComponentCompiler {
}
ServerCompiler.prototype.loadComponent = loadComponent

module.exports = (renderable, outputType) =>
  new ServerCompiler(renderable, outputType).compile()

'use strict'

const JsxLoader = require('./jsx-loader')
const componentFactory = require('../../_shared/loaders/component-loader')

class ServerLoader extends JsxLoader {
  constructor (loaderOptions, context) {
    super(loaderOptions, context)

    this.loadComponent = componentFactory(loaderOptions)
  }
}

module.exports = ServerLoader

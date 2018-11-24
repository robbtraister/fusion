'use strict'

/* global Fusion */

const JsxLoader = require('./jsx-loader')

class ClientLoader extends JsxLoader {
  loadComponent (node) {
    return node && node.collection && node.type && Fusion.components[node.collection][node.type]
  }
}

module.exports = ClientLoader

'use strict'

/* global Fusion */

const React = require('react')
const ReactDOM = require('react-dom/server')
const reactParser = require('html-react-parser')

const JsxLoader = require('./server-loader')

class QuarantineLoader extends JsxLoader {
  createElement (node) {
    const element = super.createElement(node)

    try {
      return reactParser(
        ReactDOM.renderToStaticMarkup(
          React.createElement(
            Fusion.context.Provider,
            {
              value: this.context
            },
            element
          )
        )
      )
    } catch (err) {
      console.error(err)

      return this.getErrorElement(
        {
          ...node,
          message: 'Could not render component'
        }
      )
    }
  }
}

module.exports = QuarantineLoader

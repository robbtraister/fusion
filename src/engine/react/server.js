'use strict'

const React = require('react')
const ReactDOMServer = require('react-dom/server')

const Provider = require('../../content/provider/server')

function render (rendering) {
  return Promise.resolve(ReactDOMServer.renderToStaticMarkup(
    <Provider fetch={rendering.fetch.bind(rendering)} cache={rendering.options.includeScripts && rendering.cache}>
      <rendering.component {...rendering.content} />
    </Provider>
  ))
}

module.exports = render

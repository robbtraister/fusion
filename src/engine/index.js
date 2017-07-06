'use strict'

/* global fetch, Templates */

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

const React = require('react')
const ReactDOM = require('react-dom')

const Provider = require('./provider')

const cache = {}
function cachedFetch (uri, component) {
  if (!cache.hasOwnProperty(uri)) {
    cache[uri] = fetch(uri)
      .then(res => res.json())
  }

  if (component) {
    cache[uri] = cache[uri].then(json => component.setState(json))
  } else {
    return cache[uri]
  }
}

window.render = function (props) {
  ReactDOM.render(
    <Provider fetch={cachedFetch}>
      <Templates.default {...props} />
    </Provider>,
    document.getElementById('App')
  )
}

/*
window.onload = function () {
  window.render(window.content)
}
*/

// expose react lib for Components
module.exports = require('react')

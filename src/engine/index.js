'use strict'

/* global fetch, Templates */

const ReactDOM = require('react-dom')

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

function normalize (src) {
  return src
    // strip trailing / or .htm/.html
    .replace(/(\/|\.html?)$/, '')
    // strip leading slash
    .replace(/^\/+/, '') || 'homepage'
}

fetch('/_content/' + normalize(document.location.pathname))
  .then(res => res.json())
  .then(content => ReactDOM.render(Templates.default(content), document.getElementById('App')))
  .catch(console.error)

// expose react lib for Components
module.exports = require('react')

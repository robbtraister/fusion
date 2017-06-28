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

var page = normalize(document.location.pathname)
var content = null
var loaded = 0

function render (json) {
  content = content || json
  loaded++
  if (loaded === 2) {
    ReactDOM.render(Templates.default(content), document.getElementById('App'))
  }
}

var s = document.createElement('script')
s.src = '/_templates/' + page
s.onload = function () { render() }
document.documentElement.getElementsByTagName('head')[0].appendChild(s)

fetch('/_content/' + page)
  .then(res => res.json())
  .then(render)
  .catch(console.error)

// expose react lib for Components
module.exports = require('react')

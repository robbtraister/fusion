'use strict'

/* global fetch, Components */

const ReactDOM = require('react-dom')
const Engine = require('.')

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

function fetchJSON (uri) {
  return fetch(uri).then(function (res) { return res.json() })
}

function normalize (src) {
  return src
    // strip trailing / or .htm/.html
    .replace(/(\/|\.html?)$/, '')
    // strip leading slash
    .replace(/^\/+/, '') || 'homepage'
}

function fetchContent (src) {
  return fetchJSON('/_content/' + normalize(src) + '.json')
}

function fetchLayout (src) {
  return fetchJSON('/_layouts/' + normalize(src) + '.json')
}

var fetcher = Engine.Fetcher(fetchContent, fetchLayout)
fetcher(document.location.pathname)
  .then(function (props) {
    var engine = Engine(Components)
    ReactDOM.render(engine(props), document.getElementById('App'))
  })
  .catch(console.error)

// expose react lib for Components
module.exports = require('react')

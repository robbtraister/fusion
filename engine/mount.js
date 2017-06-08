'use strict'

/* global window */

const ReactDOM = require('react-dom')
const Engine = require('.')
const $ = require('jquery')

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

function getContentSource (src) {
  return '/_content/' + src + '.json'
}

function getLayoutSource (src) {
  return '/_layouts/' + src + '.json'
}

const page = document.location.pathname
  // strip trailing / or .htm/.html
  .replace(/(\/|\.html?)$/, '')
  // strip leading slash
  .replace(/^\/+/, '') || 'homepage'

Promise.all([
  $.getJSON(getLayoutSource(page)),
  $.getJSON(getContentSource(page))
])
  .then(function (data) {
    var layout = data.shift()
    var content = data.shift()

    var engine = Engine(window.Components)
    ReactDOM.render(engine({content: content, layout: layout}), document.getElementById('App'))
  })

module.exports = require('react')

'use strict'

/* global Templates */

const ReactDOM = require('react-dom')

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

window.render = function (content) {
  ReactDOM.render(Templates.default(content), document.getElementById('App'))
}

/*
window.onload = function () {
  window.render(window.content)
}
*/

// expose react lib for Components
module.exports = require('react')

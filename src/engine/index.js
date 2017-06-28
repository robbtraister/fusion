'use strict'

/* global content, Templates */

const ReactDOM = require('react-dom')

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

window.onload = function () {
  ReactDOM.render(Templates.default(content), document.getElementById('App'))
}

// expose react lib for Components
module.exports = require('react')

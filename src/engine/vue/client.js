'use strict'

/* global Templates */

// use <link> tag in index.html since styles are published for SSR, anyway
// require('./style.scss')

const Vue = require('vue')

// require('../context/consumer')
// const Provider = require('../context/provider')

window.render = function (data) {
  let Template = Templates.default
  return new Template({
    el: '#App',
    data
  })
}

// expose vue lib for Components
module.exports = Vue

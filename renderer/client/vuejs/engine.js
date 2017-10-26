'use strict'

/* global content, Template */

const Vue = require('vue').default

// require('../context/consumer')
// const Provider = require('../context/provider')

function render (data) {
  Template.data = data
  Template.el = '#App'
  return new Vue(Template)
}

document.body.onload = () => {
  typeof content === 'undefined' || render(content)
}

require('../not-found')

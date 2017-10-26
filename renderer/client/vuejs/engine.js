'use strict'

/* global content, Template */

const Vue = require('vue').default

// require('../context/consumer')
// const Provider = require('../context/provider')

function render (data) {
  const App = Template.default
  App.data = data
  App.el = '#App'
  return new Vue(App)
}

document.body.onload = () => {
  typeof content === 'undefined' || render(content)
}

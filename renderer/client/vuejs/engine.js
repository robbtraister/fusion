'use strict'

const Vue = require('vue').default

// require('../context/consumer')
// const Provider = require('../context/provider')

require('../render')((Template, data) => {
  Template.data = data
  Template.el = '#App'
  return new Vue(Template)
})

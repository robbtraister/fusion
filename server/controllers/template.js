'use strict'

const Template = uri => Promise.resolve(uri === '404' ? '404.jsx' : 'template.jsx')

module.exports = Template

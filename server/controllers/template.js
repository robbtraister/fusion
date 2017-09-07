'use strict'

const Template = uri => Promise.resolve(uri === '/' ? 'homepage.jsx' : 'article.jsx')

module.exports = Template

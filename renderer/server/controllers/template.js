'use strict'

const templates = {
  '/': 'homepage.jsx',
  '/sports': 'article.jsx',
  '/hbs': '404.hbs'
}

const Template = uri => Promise.resolve(templates[uri] || 'simple.jsx')

module.exports = Template

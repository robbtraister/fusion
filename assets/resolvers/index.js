'use strict'

const content = match => {
  const str = (match instanceof Array)
    ? match[match.length - 1]
    : match
  return ({content: decodeURIComponent(str.replace(/^\/+/, ''))})
}

module.exports = [
  {
    match: '/',
    template: 'article.jsx',
    content
  },
  {
    match: /^(\/sports)\/?$/,
    template: 'article.jsx',
    content
  },
  {
    match: /^(\/hbs)\/?$/,
    template: '404.hbs',
    content
  },
  {
    match: /^\/404\/?$/,
    template: 'simple.jsx',
    content: () => null
  },
  {
    match: /^\/breaking-news\/?$/,
    template: 'simple.jsx',
    content: () => ({content: null})
  },
  {
    match: /^(.*)$/,
    template: 'simple.jsx',
    content
  }
]

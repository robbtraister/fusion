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
    template: 'simple.jsx',
    content: {content: 'Homepage'}
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
    match: /^\/data\/?$/,
    template: 'data.js',
    content: () => ({content: {data: 'data'}})
  },
  {
    match: /^(.*)$/,
    template: 'simple.jsx',
    content
  }
]

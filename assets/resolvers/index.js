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
    match: /^(\/sports)\/?$/i,
    template: 'article.jsx',
    content
  },
  {
    match: /^(\/handlebars)\/?$/i,
    template: 'article.hbs',
    content
  },
  {
    match: /^(\/vue)\/?$/i,
    template: 'article.vue',
    content
  },
  {
    match: /^\/404\/?$/i,
    template: 'simple.jsx',
    content: () => null
  },
  {
    match: /^\/breaking-news\/?$/i,
    template: 'simple.jsx',
    content: () => ({content: 'BREAKING NEWS!'})
  },
  {
    match: /^\/in-the-news\/?$/i,
    template: 'simple.jsx',
    content: () => ({content: ['Hurricane Jose', 'Irma', 'Richard Branson']})
  },
  {
    match: /^\/data\/?$/i,
    template: 'data.js',
    content: () => ({content: {data: 'data'}})
  },
  {
    match: /^(.*)$/,
    template: 'simple.jsx',
    content
  }
]

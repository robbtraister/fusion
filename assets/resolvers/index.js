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
    match: /^(\/vue)\/?$/,
    template: 'template.vue',
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
    content: () => ({content: 'BREAKING NEWS!'})
  },
  {
    match: /^\/in-the-news\/?$/,
    template: 'simple.jsx',
    content: () => ({content: ['Hurricane Jose', 'Irma', 'Richard Branson']})
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

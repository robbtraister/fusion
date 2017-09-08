'use strict'

const Content = uri => Promise.resolve(uri === '/404' ? null : {body: decodeURIComponent(uri.replace(/^\/+/, ''))})

module.exports = Content

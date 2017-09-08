'use strict'

const Content = uri => Promise.resolve(uri === '/404' ? null : {body: uri.replace(/^\/+/, '')})

module.exports = Content

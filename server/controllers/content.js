'use strict'

const Content = uri => Promise.resolve(uri === '/bad' ? null : {body: uri.replace(/^\/+/, '')})

module.exports = Content

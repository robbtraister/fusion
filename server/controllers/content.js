'use strict'

const content = uri => Promise.resolve(uri === '/bad' ? null : {body: uri.replace(/^\/+/, '')})

module.exports = content

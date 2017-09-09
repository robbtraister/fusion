'use strict'

const content = {
  '/404': null,
  '/breaking-news': {content: null}
}

const Content = uri => Promise.resolve(uri in content ? content[uri] : {content: decodeURIComponent(uri.replace(/^\/+/, ''))})

module.exports = Content

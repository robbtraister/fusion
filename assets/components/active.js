'use strict'

const getHref = require('./get-href')

module.exports = function (href, label, data) {
  if (typeof window !== 'undefined') {
    const computedHref = getHref(href, label)
    return (new RegExp(`^${window.location.pathname}(\\?|#|$)`)).test(computedHref) ? ' active' : ''
  } else {
    return ''
  }
}

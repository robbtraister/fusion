'use strict'

module.exports = function (href, label, data) {
  console.log(arguments)
  return href || `/${label.replace(' ', '-').toLowerCase()}`
}

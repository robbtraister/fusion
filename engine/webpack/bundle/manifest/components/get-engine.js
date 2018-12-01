'use strict'

module.exports = (ext) =>
  ext.replace(/^\.+/, '').replace(/^t/i, 'j')

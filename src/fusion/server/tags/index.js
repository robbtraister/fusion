'use strict'

module.exports = context => ({
  App: require('./app')(context),
  Fusion: require('./fusion')(context),
  Libs: require('./libs')(context),
  Styles: require('./styles')(context)
})

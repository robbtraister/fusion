'use strict'

module.exports = (env) => ({
  mode: (env.minify) ? 'production' : 'development'
})

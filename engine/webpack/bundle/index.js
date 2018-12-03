'use strict'

require('./manifest/components/mocks')

const manifest = require('./manifest')()

module.exports =
  [].concat(
    require('./components')(manifest),
    require('./content')(manifest),
    require('./properties')(manifest)
  )

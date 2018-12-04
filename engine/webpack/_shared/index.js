'use strict'

module.exports = {
  ...require('./devtool'),
  ...require('./mode'),
  ...require('./optimization'),
  ...require('./resolve'),
  ...require('./watch-options')
}

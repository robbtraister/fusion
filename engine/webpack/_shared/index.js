'use strict'

module.exports = {
  ...require('./mode'),
  ...require('./optimization'),
  ...require('./resolve'),
  ...require('./watch-options')
}

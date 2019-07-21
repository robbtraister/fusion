'use strict'

const { isProd } = require('../env')

const devtool = isProd ? 'hidden-source-map' : 'eval-source-map'

module.exports = devtool

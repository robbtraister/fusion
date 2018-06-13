'use strict'

const glob = require('glob')

const {
  componentSrcRoot
} = require('../../environment')

module.exports = glob.sync(`${componentSrcRoot}/{chains,features,layouts}/**/*.{hbs,js,jsx,vue}`)

'use strict'

const path = require('path')

const glob = require('glob')

const isTest = require('./is-test')

const {
  componentSrcRoot
} = require('../../environment')

const outputTypeSrcRoot = path.resolve(`${componentSrcRoot}/output-types`)

const outputTypes = {}
glob.sync(`${outputTypeSrcRoot}/*.{hbs,js,jsx,vue}`)
  .filter(f => !isTest(f))
  .forEach(fp => { outputTypes[path.parse(fp).name] = fp })

module.exports = outputTypes

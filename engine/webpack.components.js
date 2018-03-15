'use strict'

const path = require('path')
const glob = require('glob')

const bundleRoot = process.env.BUNDLE_ROOT || `${__dirname}/bundle`
const componentDir = path.resolve(`${bundleRoot}/components`)

const entry = {}
glob.sync(`${componentDir}/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => { entry[f.substr(componentDir.length + 1)] = f })

module.exports = require('./webpack-configs')(entry)

'use strict'

const path = require('path')

const components = require('./webpack/components')

module.exports = (entry) =>
  (Object.keys(entry).length)
    ? Object.assign(
      components(entry),
      {
        output: {
          filename: `[name].js`,
          path: path.resolve(__dirname, 'dist', 'components'),
          library: `window.Fusion=window.Fusion||{};Fusion.Template`,
          libraryTarget: 'assign'
        }
      }
    )
    : null

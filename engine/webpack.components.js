'use strict'

const fs = require('fs')
const path = require('path')

const glob = require('glob')

const { componentSrcRoot } = require('./src/environment')

const templateConfigs = require('./webpack.template.js')
const sharedConfigs = (entry) =>
  (Object.keys(entry).length)
    // return an array so 'all' can be appended onto the components
    ? [
      Object.assign(
        templateConfigs(entry),
        {
          output: {
            filename: `[name].js`,
            path: path.resolve(__dirname, 'dist', 'components'),
            libraryTarget: 'commonjs2'
          }
        }
      )
    ]
    : null

const entry = {}
const types = {}
glob.sync(`${componentSrcRoot}/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => {
    const name = f.substr(componentSrcRoot.length + 1)
    const type = name.split('/').shift()
    types[type] = true
    const parts = path.parse(name)
    entry[path.join(parts.dir, parts.name)] = f
  })

const componentConfigs = sharedConfigs(entry)
if (componentConfigs) {
  fs.writeFileSync(`./all.jsx`,
    `
const Components = {}
${Object.keys(types).map(type => `Components['${type}'] = Components['${type}'] || {}`).join('\n')}
${Object.keys(entry).map(name => {
    const f = entry[name]
    const pieces = name.split('/')
    const type = pieces.shift()
    const id = pieces.join('/')
    return `Components['${type}']['${id.replace(/\.(hbs|jsx?|vue)$/, '')}'] = require('${f}')`
  }).join('\n')}
module.exports = Components
    `
  )
  // shift the only element out of the array
  const allConfig = sharedConfigs({ all: './all.jsx' }).shift()
  allConfig.output.library = `window.Fusion=window.Fusion||{};Fusion.Components`
  allConfig.output.libraryTarget = 'assign'

  // clear local compilations for developers
  // allConfig.plugins.push()

  componentConfigs.push(allConfig)
}

module.exports = componentConfigs

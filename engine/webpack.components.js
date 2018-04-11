'use strict'

const fs = require('fs')
const glob = require('glob')

const sharedConfigs = require('./webpack-jsx-configs')

const { componentSrcRoot } = require('./src/environment')

const entry = {}
const types = {}
glob.sync(`${componentSrcRoot}/**/*.{hbs,js,jsx,vue}`)
  .forEach(f => {
    const name = f.substr(componentSrcRoot.length + 1)
    const type = name.split('/')[0]
    types[type] = true
    entry[name] = f
  })

const componentConfigs = sharedConfigs(entry)

const otherConfigs = []
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
  const allConfig = sharedConfigs({ 'all.js': './all.jsx' })
  allConfig.output.library = `window.Fusion=window.Fusion||{};Fusion.Components`
  allConfig.output.libraryTarget = 'assign'
  otherConfigs.push(allConfig)
}

module.exports = [componentConfigs].concat(otherConfigs)

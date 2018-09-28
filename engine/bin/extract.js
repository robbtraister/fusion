#!/usr/bin/env node

'use strict'

const fs = require('fs')
const url = require('url')

const {
  sourcesSrcRoot
} = require('../environment')

const model = require('../src/dao/mongo')

model('jge_config').find()
  .then((configs) => {
    configs.map((config) => {
      console.log(`Extracting: ${config._id}`)
      config.pattern = url.format(
        Object.assign(
          url.parse(config.pattern),
          { auth: null }
        )
      )
      fs.writeFileSync(`${sourcesSrcRoot}/${config._id}.json`, JSON.stringify(config, null, 2))
      console.log(`Successfully extracted: ${config._id}`)
    })
    console.log(`Extraction complete.`)
  })
  .catch(console.error)
  .then(() => {
    // mongo connection will keep the process running
    process.exit(0)
  })

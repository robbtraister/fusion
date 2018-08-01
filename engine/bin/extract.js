#!/usr/bin/env node

'use strict'

const fs = require('fs')

const {
  sourcesRoot
} = require('../environment')

const model = require('../src/dao/mongo')

model('jge_config').find()
  .then((configs) => {
    configs.map((config) => {
      console.log(`Extracting: ${config._id}`)
      fs.writeFileSync(`${sourcesRoot}/${config._id}.json`, JSON.stringify(config, null, 2))
      console.log(`Successfully extracted: ${config._id}`)
    })
    console.log(`Extraction complete.`)
  })
  .catch(console.error)
  .then(() => {
    // mongo connection will keep the process running
    process.exit(0)
  })

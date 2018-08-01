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
      fs.writeFileSync(`${sourcesRoot}/${config._id}.json`, JSON.stringify(config, null, 2))
    })
  })
  .catch(console.error)
  .then(() => {
    // mongo connection will keep the process running
    process.exit(0)
  })

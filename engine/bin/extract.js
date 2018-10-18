#!/usr/bin/env node

'use strict'

const fs = require('fs')
const url = require('url')

const {
  sourcesSrcRoot
} = require('../environment')

const model = require('../src/dao/mongo')

async function extract () {
  try {
    const configs = await model('jge_config').find()
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
  } catch (e) {
    console.error(e)
  }
  // mongo connection will keep the process running
  process.exit(0)
}

extract()

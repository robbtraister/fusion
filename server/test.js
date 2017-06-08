'use strict'

const fs = require('fs')
const path = require('path')

const promisify = require('./promisify')

const readFile = promisify(fs.readFile)
const base = path.join(__dirname, '..', 'layouts')

readFile(path.join(base, 'article.json'))
  .then(console.log)
  .catch(console.error)

'use strict'

const fs = require('fs')
const url = require('url')

const CACHE_DIR = `${__dirname}/../../../renderings`

function clear (uri) {
  return new Promise((resolve, reject) => {
    fs.unlink(file(uri), err => {
      err ? reject(err) : resolve()
    })
  })
}

function file (uri) {
  return `${CACHE_DIR}/${url.parse(uri).pathname.replace(/^\/*/, '') || 'index'}.html`
}

function read (uri) {
  return new Promise((resolve, reject) => {
    fs.readFile(file(uri), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

function write (uri, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file(uri), data, err => {
      err ? reject(err) : resolve()
    })
  })
}

module.exports = (uri, data) => {
  return (data ? write : read)(uri, data)
}
module.exports.clear = clear
module.exports.file = file
module.exports.read = read
module.exports.write = write

'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const url = require('url')

const CACHE_ROOT = `${__dirname}/../../../renderings`

function clear (uri) {
  return new Promise((resolve, reject) => {
    fs.unlink(file(uri), err => {
      err ? reject(err) : resolve()
    })
  })
}

function file (uri) {
  let pieces = url.parse(uri, true)
  let base = pieces.pathname.replace(/^\/*/, '')
  let outputType = pieces.query.outputType || 'default'
  let experiment = pieces.query.experiment || 'index'

  return `${CACHE_ROOT}/${base}/${outputType}/${experiment}.html`
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
    let target = file(uri)
    childProcess.exec(`mkdir -p ${path.dirname(target)}`, (err) => {
      if (err) {
        reject(err)
      } else {
        fs.writeFile(file(uri), data, err => {
          err ? reject(err) : resolve()
        })
      }
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

'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const glob = require('glob')

const exec = promisify(childProcess.exec.bind(childProcess))
const copyFile = promisify(fs.copyFile.bind(fs))
const readFile = promisify(fs.readFile.bind(fs))

function writeFile (filePath, contents) {
  return new Promise((resolve, reject) => {
    childProcess.exec(`mkdir -p '${path.dirname(filePath)}'`, (err) => {
      if (err) {
        return reject(err)
      }
      fs.writeFile(filePath, contents, (err) => {
        err ? reject(err) : resolve()
      })
    })
  })
}

module.exports = {
  copyFile,
  exec,
  glob: promisify(glob),
  readFile,
  writeFile
}

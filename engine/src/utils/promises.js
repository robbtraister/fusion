'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const glob = require('glob')

const exec = promisify(childProcess.exec.bind(childProcess))
const copyFile = promisify(fs.copyFile.bind(fs))

function readFile (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data.toString())
      }
    )
  })
}

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

'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { promisify } = require('util')

const execPromise = promisify(childProcess.exec.bind(childProcess))
const mkdirPromise = dir => execPromise(`mkdir -p '${dir}'`)
const readFilePromise = promisify(fs.readFile.bind(fs))
const writeFilePromise = promisify(fs.writeFile.bind(fs))

async function tempDir () {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(os.tmpdir(), (err, dir) => (err ? reject(err) : resolve(dir)))
  })
}

async function writeFile (filePath, content) {
  await mkdirPromise(path.dirname(filePath))
  return writeFilePromise(filePath, content)
}

module.exports = {
  exec: execPromise,
  mkdir: mkdirPromise,
  readFile: readFilePromise,
  tempDir,
  writeFile
}

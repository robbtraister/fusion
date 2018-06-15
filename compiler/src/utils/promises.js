'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const { promisify } = require('util')

const copy = (src, dest) => exec(`cp -R ${src} ${dest}`)
const exec = promisify(childProcess.exec.bind(childProcess))
const glob = promisify(require('glob'))
const mkdirp = (d) => exec(`mkdir -p '${d}'`).then(() => d)
const readFile = promisify(fs.readFile.bind(fs))
const remove = (dest) => exec(`rm -rf ${dest}`)
const spawn = (cmd, args, options) => new Promise((resolve, reject) => {
  const proc = childProcess.spawn(cmd, args, options)
  proc.on('close', (code) => {
    code === 0 ? resolve() : reject(new Error(`"${cmd}" exited with code: ${code}`))
  })
})
const stat = promisify(fs.stat.bind(fs))
const tempDir = () => exec('mktemp -d').then(d => d.trim())
const tempFile = () => exec('mktemp').then(d => d.trim())
const writeFile = promisify(fs.writeFile.bind(fs))

module.exports = {
  copy,
  exec,
  glob,
  mkdirp,
  readFile,
  remove,
  spawn,
  stat,
  tempDir,
  tempFile,
  writeFile
}

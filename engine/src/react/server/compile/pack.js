'use strict'

const fs = require('fs')
const path = require('path')

const MemoryFS = require('memory-fs')
const webpack = require('webpack')

const debugTimer = require('debug')('fusion:timer:react:compile:pack')

const promisify = require('../../../utils/promisify')

const generateSource = require('./source')
const {
  componentDistRoot,
  componentSrcRoot
} = require('../../../environment')
const timer = require('../../../timer')
const getConfigs = require('../../../../webpack.template.js')

const sourceFile = path.resolve(`${componentSrcRoot}/template.jsx`)
const destFile = path.resolve(`${componentDistRoot}/template.js`)
const manifestFile = path.resolve(`${componentDistRoot}/manifest.json`)

const getMemoryFS = function getMemoryFS () {
  const memFs = new MemoryFS()
  // enable read-through access
  // this is necessary for node modules
  const statOrig = memFs.stat.bind(memFs)
  const readFileOrig = memFs.readFile.bind(memFs)
  memFs.stat = function (_path, cb) {
    statOrig(_path, function (err, result) {
      return (err)
        ? fs.stat(_path, cb)
        : cb(err, result)
    })
  }
  memFs.readFile = function (_path, cb) {
    readFileOrig(_path, function (err, result) {
      return (err)
        ? fs.readFile(_path, cb)
        : cb(err, result)
    })
  }

  memFs.mkdirpPromise = promisify(memFs.mkdirp.bind(memFs))
  memFs.readFilePromise = promisify(memFs.readFile.bind(memFs))
  memFs.writeFilePromise = promisify(memFs.writeFile.bind(memFs))

  return memFs
}

const compile = function compile (src) {
  let tic = timer.tic()

  const mfs = getMemoryFS()

  return Promise.all([
    Promise.resolve({template: sourceFile})
      .then(getConfigs)
      .then(webpack)
      .then((compiler) => {
        compiler.inputFileSystem = mfs
        compiler.outputFileSystem = mfs

        debugTimer('webpack setup', tic.toc())

        return compiler
      }),
    mfs.mkdirpPromise(path.dirname(sourceFile))
      .then(() => mfs.writeFilePromise(sourceFile, src))
      .then(() => {
        debugTimer('write source to memory fs', tic.toc())
      }),
    mfs.mkdirpPromise(path.dirname(destFile))
  ])
    .then(([compiler]) => {
      tic = timer.tic()
      return promisify(compiler.run.bind(compiler))()
    })
    .then((data) => {
      debugTimer('webpack compilation', tic.toc())

      if (data.hasErrors()) {
        return Promise.reject(data.toJson().errors)
      }
    })
    .then(() => Promise.all([
      mfs.readFilePromise(destFile)
        .then((srcBuf) => srcBuf.toString()),
      mfs.readFilePromise(manifestFile)
        .then((manifestJson) => {
          const manifest = JSON.parse(manifestJson.toString())
          const cssFile = manifest['template.css']
          return cssFile
            ? mfs.readFilePromise(`${componentDistRoot}/${cssFile}`)
              .then((cssBuf) => cssBuf.toString())
              .then((css) => ({cssFile, css}))
            : {
              cssFile: null,
              css: null
            }
        })
    ]))
    .then(([src, {cssFile, css}]) => ({src, cssFile, css}))
}

const pack = function pack ({renderable, outputType, useComponentLib}) {
  let tic = timer.tic()
  return generateSource(renderable, outputType, useComponentLib)
    .then((src) => {
      debugTimer('generate source', tic.toc())

      return (useComponentLib)
        ? {src}
        : compile(src)
    })
}

module.exports = pack

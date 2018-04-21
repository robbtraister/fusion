'use strict'

const fs = require('fs')
const path = require('path')

const MemoryFS = require('memory-fs')
const webpack = require('webpack')

const debugTimer = require('debug')('fusion:timer:react:compile:pack')

const compileSource = require('./source')
const {
  componentDistRoot,
  componentSrcRoot
} = require('../../../environment')
const timer = require('../../../timer')
const getConfigs = require('../../../../webpack.template.js')

const sourceFile = path.resolve(`${componentSrcRoot}/templates/Template.jsx`)
const destFile = path.resolve(`${componentDistRoot}/template.js`)
const manifestFile = path.resolve(`${componentDistRoot}/manifest.json`)

const getMemoryFS = function getMemoryFS () {
  const memFs = new MemoryFS()
  const statOrig = memFs.stat.bind(memFs)
  const readFileOrig = memFs.readFile.bind(memFs)
  memFs.stat = function (_path, cb) {
    statOrig(_path, function (err, result) {
      if (err) {
        return fs.stat(_path, cb)
      } else {
        return cb(err, result)
      }
    })
  }
  memFs.readFile = function (path, cb) {
    readFileOrig(path, function (err, result) {
      if (err) {
        return fs.readFile(path, cb)
      } else {
        return cb(err, result)
      }
    })
  }
  return memFs
}

const pack = function pack ({renderable, outputType, useComponentLib}) {
  let tic = timer.tic()
  return compileSource(renderable, outputType, useComponentLib)
    .then((source) => new Promise((resolve, reject) => {
      debugTimer('generate source', tic.toc())
      if (useComponentLib) {
        return resolve(source)
      } else {
        try {
          tic = timer.tic()

          const mfs = getMemoryFS()

          mfs.mkdirpSync(path.dirname(sourceFile))
          mfs.mkdirpSync(path.dirname(destFile))
          mfs.writeFileSync(sourceFile, source)

          debugTimer('write source to memory fs', tic.toc())
          tic = timer.tic()

          const configs = getConfigs({
            template: sourceFile
          })

          debugTimer('webpack configs', tic.toc())
          tic = timer.tic()

          const compiler = webpack(configs)
          compiler.inputFileSystem = mfs
          compiler.outputFileSystem = mfs

          debugTimer('webpack setup', tic.toc())
          tic = timer.tic()

          compiler.run((err, data) => {
            debugTimer('webpack compilation', tic.toc())

            if (err) {
              return reject(err)
            }
            if (data.hasErrors()) {
              return reject(data.toJson().errors)
            }

            const manifest = JSON.parse(mfs.readFileSync(manifestFile).toString())
            const cssName = 'template.css'
            const cssFile = manifest[cssName]
            const css = mfs.readFileSync(`${componentDistRoot}/${cssFile}`).toString()
            const src = mfs.readFileSync(destFile).toString()

            resolve({src, cssFile, css})
          })
        } catch (e) {
          reject(e)
        }
      }
    }))
}

module.exports = pack

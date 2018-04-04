'use strict'

const fs = require('fs')
const path = require('path')

const MemoryFS = require('memory-fs')
const webpack = require('webpack')

const debugTimer = require('debug')('fusion:timer:react:compile:pack')

const compileSource = require('./source')
const timer = require('../../../timer')
const getConfigs = require('../../../../webpack-jsx-configs.js')

const sourceFile = path.resolve(`${__dirname}/../../../../bundle/components/templates/Template.jsx`)
const destFile = path.resolve(`${__dirname}/../../../../dist/components/templates/Template.jsx`)

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

const pack = function pack (rendering, isAdmin) {
  let tic = timer.tic()
  return compileSource(rendering, isAdmin)
    .then((source) => new Promise((resolve, reject) => {
      debugTimer('generate source', tic.toc())
      if (isAdmin) {
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
            'templates/Template.jsx': sourceFile
          })
          configs.output.library = `window.Fusion=window.Fusion||{};Fusion.Template`
          configs.output.libraryTarget = 'assign'

          debugTimer('webpack configs', tic.toc())
          tic = timer.tic()

          const compiler = webpack(configs)
          compiler.inputFileSystem = mfs
          compiler.outputFileSystem = mfs

          debugTimer('webpack setup', tic.toc())
          tic = timer.tic()

          compiler.run((err, data) => {
            debugTimer('webpack compilation', tic.toc())
            ;(err)
              ? reject(err)
              : (data.hasErrors())
                ? reject(data.toJson().errors)
                : resolve(mfs.readFileSync(destFile).toString())
          })
        } catch (e) {
          reject(e)
        }
      }
    }))
}

module.exports = pack

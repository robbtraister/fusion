'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const MemoryFS = require('memory-fs')
const webpack = require('webpack')

const debugTimer = require('debug')('fusion:models:rendering:compile:timer')

const { generateSource } = require('../../react')

const {
  componentDistRoot,
  componentSrcRoot,
  defaultOutputType
} = require('../../../environment')
const timer = require('../../timer')
const getConfigs = require('../../../webpack/template.js')

const { sendMetrics, METRIC_TYPES } = require('../../utils/send-metrics')
const { LOG_TYPES, ...logger } = require('../../utils/logger')

const scriptSourceFile = path.resolve(`${componentSrcRoot}/script.js`)
const stylesSourceFile = path.resolve(`${componentSrcRoot}/styles.js`)
const scriptDestFile = path.resolve(`${componentDistRoot}/script.js`)
const stylesDestFile = path.resolve(`${componentDistRoot}/styles.js`)
const manifestFile = path.resolve(`${componentDistRoot}/styles.manifest.json`)

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

  const mkdirpPromise = promisify(memFs.mkdirp.bind(memFs))
  const readFilePromise = promisify(memFs.readFile.bind(memFs))
  const writeFilePromise = promisify(memFs.writeFile.bind(memFs))

  memFs.readFilePromise = (fp) =>
    readFilePromise(fp).then(buf => buf.toString())
  memFs.mkdirpPromise = mkdirpPromise
  memFs.writeFilePromise = (fp, src) =>
    mkdirpPromise(path.dirname(fp))
      .then(() => writeFilePromise(fp, src))

  return memFs
}

const compileSource = function compileSource (script, styles) {
  let tic = timer.tic()

  const mfs = getMemoryFS()

  return Promise.all([
    Promise.resolve(getConfigs(scriptSourceFile, stylesSourceFile))
      .then(webpack)
      .then((compiler) => {
        compiler.inputFileSystem = mfs
        compiler.outputFileSystem = mfs

        const elapsedTime = tic.toc()
        debugTimer('webpack setup', elapsedTime)
        sendMetrics([{type: METRIC_TYPES.WEBPACK_DURATION, value: elapsedTime, tags: ['webpack-op:setup']}])
        logger.logInformation({logType: LOG_TYPES.WEBPACK_COMPILATION, message: 'Webpack setup succeeded', values: {}})

        return compiler
      }),
    mfs.writeFilePromise(scriptSourceFile, script)
      .then(() => {
        debugTimer('write script source to memory fs', tic.toc())
      }),
    mfs.writeFilePromise(stylesSourceFile, styles)
      .then(() => {
        debugTimer('write styles source to memory fs', tic.toc())
      }),
    mfs.mkdirpPromise(path.dirname(scriptDestFile)),
    mfs.mkdirpPromise(path.dirname(stylesDestFile))
  ])
    .then(([compiler]) => {
      tic = timer.tic()
      return promisify(compiler.run.bind(compiler))()
    })
    .then((data) => {
      const elapsedTime = tic.toc()
      debugTimer('webpack compilation', elapsedTime)
      sendMetrics([{ type: METRIC_TYPES.WEBPACK_DURATION, value: elapsedTime, tags: ['webpack-op:compile'] }])

      if (data.hasErrors()) {
        return Promise.reject(data.toJson().errors)
      }
    })
    .then(() => Promise.all([
      mfs.readFilePromise(scriptDestFile),
      mfs.readFilePromise(manifestFile)
        .then((manifestJson) => {
          const manifest = JSON.parse(manifestJson)
          const cssFile = manifest['styles.css']
          return cssFile
            ? mfs.readFilePromise(`${componentDistRoot}/${cssFile}`)
              .then((css) => ({ css, cssFile }))
            : {
              css: null,
              cssFile: null
            }
        })
        .catch(logger.logError({ logType: LOG_TYPES.WEBPACK_COMPILATION, message: 'Failed to compile' }))
    ]))
    .then(([js, { css, cssFile }]) => ({ js, css, cssFile }))
}

const compileRendering = function compileRendering ({ rendering, outputType = defaultOutputType }) {
  let tic = timer.tic()
  return generateSource(rendering, outputType)
    .then(({ script, styles }) => {
      const generateSourceDuration = tic.toc()
      debugTimer('generate source', generateSourceDuration)
      sendMetrics([{ type: METRIC_TYPES.COMPILE_DURATION, value: generateSourceDuration, tags: ['compile:generate-source'] }])

      return compileSource(script, styles)
    })
    .then(({ js, css, cssFile }) => {
      const cssPath = cssFile ? `styles/${cssFile}` : null
      js = js.replace(/;*$/, `;Fusion.Template.cssFile=${cssPath ? `'${cssPath}'` : 'null'}`)

      return { js, css, cssFile: cssPath }
    })
}

module.exports = compileRendering

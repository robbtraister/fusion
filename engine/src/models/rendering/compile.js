'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const MemoryFS = require('memory-fs')
const webpack = require('webpack')

const debugTimer = require('debug')('fusion:models:rendering:compile:timer')

const { generateSource } = require('../../react')

const {
  componentBuildRoot,
  componentSrcRoot,
  defaultOutputType
} = require('../../../environment')
const timer = require('../../timer')
const getConfigs = require('../../../webpack/template.js')

const { sendMetrics, METRIC_TYPES } = require('../../utils/send-metrics')

const scriptSourceFile = path.resolve(`${componentSrcRoot}/script.js`)
const stylesSourceFile = path.resolve(`${componentSrcRoot}/styles.js`)
const scriptDestFile = path.resolve(`${componentBuildRoot}/script.js`)
const stylesDestFile = path.resolve(`${componentBuildRoot}/styles.js`)
const manifestFile = path.resolve(`${componentBuildRoot}/styles.manifest.json`)

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

  memFs.readFilePromise = async (fp) => {
    const buf = await readFilePromise(fp)
    return buf.toString()
  }
  memFs.mkdirpPromise = mkdirpPromise
  memFs.writeFilePromise = async (fp, src) => {
    await mkdirpPromise(path.dirname(fp))
    return writeFilePromise(fp, src)
  }

  return memFs
}

const compileSource = async function compileSource (script, styles) {
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
        sendMetrics([{ type: METRIC_TYPES.WEBPACK_DURATION, value: elapsedTime, tags: ['webpack-op:setup'] }])

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
            ? mfs.readFilePromise(`${componentBuildRoot}/${cssFile}`)
              .then((css) => ({ css, cssFile }))
            : {
              css: null,
              cssFile: null
            }
        })
        .catch(() => ({}))
    ]))
    .then(([js, { css, cssFile }]) => ({ js, css, cssFile }))
}

const compileRendering = async function compileRendering ({ rendering, outputType = defaultOutputType }) {
  const tic = timer.tic()
  const { script, styles } = await generateSource(rendering, outputType)
  const generateSourceDuration = tic.toc()
  debugTimer('generate source', generateSourceDuration)
  sendMetrics([{ type: METRIC_TYPES.COMPILE_DURATION, value: generateSourceDuration, tags: ['compile:generate-source'] }])

  const { js, css, cssFile } = await compileSource(script, styles)
  const cssPath = cssFile ? `styles/${cssFile}` : null

  return {
    js: js.replace(/;*$/, `;Fusion.Template.cssFile=${cssPath ? `'${cssPath}'` : 'null'}`),
    css,
    cssFile: cssPath
  }
}

module.exports = compileRendering

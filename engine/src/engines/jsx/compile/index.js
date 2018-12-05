'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { promisify } = require('util')

const webpack = require('webpack')

require('../mocks')

const config = require('./config')
const generateSource = require('./source')

const getFallbacks = require('../../_shared/fallbacks')

const { putCompilation } = require('../../../io')
const metrics = require('../../../metrics')
const timer = require('../../../utils/timer')

const { bundleRoot, deployment, minify } = require('../../../../environment')

const mkdtemp = promisify(fs.mkdtemp.bind(fs))
const readFile = promisify(fs.readFile.bind(fs))
const rmdir = promisify(fs.rmdir.bind(fs))
const unlink = promisify(fs.unlink.bind(fs))
const writeFile = promisify(fs.writeFile.bind(fs))

const SOURCE_FILE = 'source.js'
const MANIFEST_FILE = 'manifest.json'
const getScriptFile = (targetName) => `${targetName}.js`
const getScriptMapFile = (targetName) => `${targetName}.js.map`
const getStylesFile = (targetName) => `${targetName}.css`
const getStylesMapFile = (targetName) => `${targetName}.css.map`

const componentRoot = path.resolve(bundleRoot, 'components')

async function trackLatency (operation, fn) {
  const latencyTic = timer.tic()
  const result = await fn()
  metrics({
    'arc.fusion.webpack.duration':
      {
        operation,
        value: latencyTic.toc()
      }
  })
  return result
}

async function compile (props) {
  const { outputType } = props

  const source = await trackLatency(
    'generate',
    () =>
      generateSource({
        componentRoot,
        outputTypes: getFallbacks({
          ext: '.jsx',
          outputType
        }),
        props
        // tree: getTree(props)
      })
  )

  const tempDir = await mkdtemp(`${os.tmpdir()}${path.sep}`)

  try {
    const sourceFilePath = path.join(tempDir, SOURCE_FILE)
    const manifestFilePath = path.join(tempDir, MANIFEST_FILE)
    const scriptFilePath = path.join(tempDir, getScriptFile(outputType))

    await writeFile(sourceFilePath, source)

    try {
      const compiler = await trackLatency(
        'setup',
        () =>
          webpack(
            config({
              entry: {
                [ outputType ]: sourceFilePath
              },
              minify,
              outputDir: tempDir,
              rootPath: bundleRoot
            })
          )
      )

      await trackLatency('compile', promisify(compiler.run.bind(compiler)))

      const manifest = require(manifestFilePath)

      const getManifestPath = (entry) => {
        const fileName = manifest[entry]
        return (fileName)
          ? path.join(tempDir, fileName)
          : null
      }

      const scriptMapPath = getManifestPath(getScriptMapFile(outputType))
      const stylesPath = getManifestPath(getStylesFile(outputType))
      const stylesMapPath = getManifestPath(getStylesMapFile(outputType))

      try {
        const [ script, scriptMap, styles, stylesMap ] = await Promise.all([
          (await readFile(scriptFilePath)).toString(),
          scriptMapPath
            ? (await readFile(scriptMapPath)).toString()
            : null,
          stylesPath
            ? (await readFile(stylesPath)).toString()
            : null,
          stylesMapPath
            ? (await readFile(stylesMapPath)).toString()
            : null
        ])

        const hash = stylesPath
          ? path.parse(stylesPath).name
          : null

        const compilation = {
          hash,
          script: (
            (script && scriptMap)
              ? script.replace(/\s*$/, `?d=${deployment}`)
              : script
          ) + `\n/**/;Fusion.tree.cssHash=${hash ? `'${hash}'` : 'null'}`,
          scriptMap,
          styles: (styles && stylesMap)
            ? styles.replace(/\s*\*\/\s*$/, `?d=${deployment}*/`)
            : styles,
          stylesMap
        }

        putCompilation && putCompilation(`${props.type}/${props.id}/${props.outputType}`, compilation)

        return compilation
      } catch (err) {
        console.error(err)
      } finally {
        await Promise.all(
          Object.values(manifest)
            .map(fileName => path.join(tempDir, fileName))
            .map(filePath => unlink(filePath))
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      await unlink(sourceFilePath)
      await unlink(manifestFilePath)
    }
  } catch (err) {
    console.error(err)
  } finally {
    await rmdir(tempDir)
  }
}

module.exports = async function renderJsxJs (filePath, props, callback) {
  try {
    callback(null, await compile(props))
  } catch (err) {
    console.error(err)
    callback(err)
  }
}

module.exports.compile = compile

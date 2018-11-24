'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { promisify } = require('util')

const webpack = require('webpack')

const config = require('./config')
const generateSource = require('./source')

const getTree = require('../../_shared/rendering-to-tree')
const fallbackFactory = require('../../_shared/fallbacks')

const mkdtemp = promisify(fs.mkdtemp.bind(fs))
const readFile = promisify(fs.readFile.bind(fs))
const rmdir = promisify(fs.rmdir.bind(fs))
const unlink = promisify(fs.unlink.bind(fs))
const writeFile = promisify(fs.writeFile.bind(fs))

const SOURCE_FILE = 'source.js'
const MANIFEST_FILE = 'manifest.json'
const SCRIPT_FILE = 'target.js'
const STYLES_FILE = `${SCRIPT_FILE}.css`

module.exports = (env) => {
  const { bundleRoot, minify, putCompilation } = env

  const getFallbacks = fallbackFactory(env)

  const componentRoot = path.resolve(bundleRoot, 'components')

  return async function compile (props) {
    const source = generateSource({
      componentRoot,
      outputTypes: getFallbacks({
        ext: '.jsx',
        outputType: props.outputType
      }),
      tree: getTree(props)
    })

    const tempDir = await mkdtemp(`${os.tmpdir()}${path.sep}`)

    try {
      const sourceFilePath = path.join(tempDir, SOURCE_FILE)
      const manifestFilePath = path.join(tempDir, MANIFEST_FILE)
      const scriptFilePath = path.join(tempDir, SCRIPT_FILE)

      await writeFile(sourceFilePath, source)

      try {
        const compiler = webpack(
          config({
            entry: {
              [ SCRIPT_FILE ]: sourceFilePath
            },
            minify,
            outputDir: tempDir,
            rootPath: bundleRoot
          })
        )

        const build = promisify(compiler.run.bind(compiler))

        await build()

        const stylesFile = require(manifestFilePath)[STYLES_FILE]
        const stylesFilePath = (stylesFile)
          ? path.join(tempDir, stylesFile)
          : null

        try {
          const [ script, styles ] = await Promise.all([
            (await readFile(scriptFilePath)).toString(),
            stylesFilePath
              ? (await readFile(stylesFilePath)).toString()
              : null
          ])

          const hash = stylesFile
            ? path.parse(stylesFile).name
            : null

          const compilation = {
            hash,
            script: script
              .replace(/;*$/, `;Fusion.tree.cssHash=${hash ? `'${hash}'` : 'null'}`),
            styles
          }

          putCompilation && putCompilation(`${props.type}/${props.id}/${props.outputType}`, compilation)

          return compilation
        } catch (err) {
          console.error(err)
        } finally {
          stylesFilePath && await unlink(stylesFilePath)
        }
      } catch (err) {
        console.error(err)
      } finally {
        await unlink(sourceFilePath)
        await unlink(scriptFilePath)
        await unlink(manifestFilePath)
      }
    } catch (err) {
      console.error(err)
    } finally {
      await rmdir(tempDir)
    }
  }
}

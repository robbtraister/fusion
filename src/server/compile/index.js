'use strict'

const crypto = require('crypto')
const path = require('path')

const Concat = require('concat-with-sourcemaps')
const webpack = require('webpack')

const getConfig = require('./webpack.config')

const { getDescendants } = require('@robbtraister/fusion-components/utils')

const {
  exec,
  mkdir,
  readFile,
  tempDir,
  writeFile
} = require('../../utils/promises')

const unpack = require('../../utils/unpack')

const { bundleRoot, distRoot } = require('../../../env')

function collectComponents (renderables) {
  const components = {}
  renderables.forEach(({ collection, type }) => {
    components[collection] = components[collection] || {}
    components[collection][type] = {
      collection,
      type,
      import: path.join(bundleRoot, `components/${collection}/${type}`)
    }
  })
  return components
}

function componentImport (component) {
  return `Fusion.components['${component.collection}']['${
    component.type
  }'] = unpack(require('${component.import}'))`
}

class Compiler {
  constructor ({ outputType, template, tree }) {
    this.outputType = outputType
    this.template = template
    this.name = `${template}/${outputType}`
    this.tree = tree
    this.renderables = getDescendants({ children: tree })

    this.rootDir = tempDir()
  }

  async compile () {
    const start = Date.now()
    await this.generate()

    try {
      const config = getConfig(await this.rootDir, this.name)
      const compiler = webpack(config)

      await new Promise((resolve, reject) => {
        compiler.run((err, ...resp) => {
          err ? reject(err) : resolve(...resp)
        })
      })

      const result = await this.concat()
      console.log(`${this.name} compiled in ${(Date.now() - start) / 1000}s`)
      return result
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      await exec(`rm -rf '${await this.rootDir}'`)
    }
  }

  async concat () {
    const { assets } = require(path.join(distRoot, 'components/assets'))

    const assetMap = {}
    this.renderables.forEach(({ collection, type }) => {
      ;[].concat(assets[`components/${collection}/${type}`]).forEach(asset => {
        assetMap[asset] = true
      })
    })
    const mappedAssets = Object.keys(assetMap)

    const css = (await Promise.all(
      mappedAssets
        .filter(asset => /\.css$/.test(asset))
        // try to keep compilation hashes consistent for re-use
        .sort()
        .map(asset => path.join(distRoot, asset))
        .map(filePath => readFile(filePath))
    )).join('\n')

    const styleHash = crypto
      .createHash('md5')
      .update(css)
      .digest('hex')

    const concat = new Concat(true, `dist/templates/${this.name}.js`, '\n')

    ;(await Promise.all(
      mappedAssets
        .filter(asset => /\.js$/.test(asset))
        // don't sort here; order matters
        .map(asset => ({
          asset,
          path: path.join(distRoot, asset)
        }))
        .concat({
          asset: `templates/${this.name}.js`,
          path: path.join(await this.rootDir, `dist/templates/${this.name}.js`)
        })
        .map(async entry => {
          const source = await readFile(entry.path)
          let sourceMap
          try {
            sourceMap = JSON.parse(await readFile(`${entry.path}.map`))
          } catch (_) {}

          return {
            asset: entry.asset,
            source,
            sourceMap
          }
        })
    ))
      // after all files are read into buffers, write them out in order
      .map(entry => {
        concat.add(entry.asset, entry.source, entry.sourceMap)
      })

    const template = {
      js: `${
        concat.content
      }\n;window.Fusion=window.Fusion||{};Fusion.styleHash=${JSON.stringify(
        styleHash
      )};`,
      jsMap: concat.sourceMap,
      css
    }

    await Promise.all([
      writeFile(path.join(distRoot, `templates/${this.name}.js`), template.js),
      template.jsMap &&
        writeFile(
          path.join(distRoot, `templates/${this.name}.js.map`),
          template.jsMap
        ),
      writeFile(
        path.join(distRoot, `templates/${this.name}.css.json`),
        JSON.stringify({ styleHash })
      ),
      writeFile(
        path.join(distRoot, `styles/${styleHash}.css`),
        template.css
      )
    ])

    return template
  }

  async generate () {
    const components = collectComponents(this.renderables)

    const imports = []
      .concat(
        ...Object.keys(components).map(collection => {
          return [
            `Fusion.components['${collection}'] = Fusion.components['${collection}'] || {}`
          ].concat(Object.values(components[collection]).map(componentImport))
        })
      )
      .join('\n')

    const template = `
${unpack}

window.Fusion = window.Fusion || {}
Fusion.components = Fusion.components || {}
${imports}

Fusion.layout = ${JSON.stringify(
  this.renderables && this.renderables[0] && this.renderables[0].collection === 'layouts'
    ? this.renderables[0].type
    : undefined
)}
Fusion.outputType = ${JSON.stringify(this.outputType)}
Fusion.template = ${JSON.stringify(this.template)}
Fusion.tree = ${JSON.stringify(this.tree)}
`

    await mkdir(await this.rootDir)
    return writeFile(path.join(await this.rootDir, 'index.js'), template)
  }
}

async function compile (props) {
  return new Compiler(props).compile()
}

module.exports = compile

if (module === require.main) {
  compile({ template: 'abc', tree: require('../../trees/abc') })
}

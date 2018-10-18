'use strict'

const debug = require('debug')('fusion:models:rendering')

const {
  defaultOutputType
} = require('../../../environment')

const { components } = require('../../../manifest')

const allOutputTypes = Object.keys(components.outputTypes)

const compileRendering = require('./compile')
const getComponent = require('./component')
const {
  publishOutputTypes,
  publishToOtherVersions
} = require('./publish')

const model = require('../../dao')

const { render } = require('../../react')
const substitute = require('../../react/shared/utils/substitute')

const getSource = require('../sources')

const {
  fetchAsset,
  fetchCssHash,
  getJson,
  pushAsset,
  pushCssHash,
  putJson
} = require('../../io')

class Rendering {
  constructor (type, id, json) {
    this.type = type
    this.id = id
    this.name = `${type}/${id}`
    this.json = json
    this.compilations = {}
  }

  async fetchJson () {
    if (this.json) {
      return this.json
    }

    const json = await getJson(this.type, this.id)
    if (!json) {
      const e = new Error(`No rendering found: ${this.type}/${this.id}`)
      e.statusCode = 404
      throw e
    }
    return json
  }

  // Lazy load all the things (YpAGNI)

  async getJson () {
    this.jsonPromise = this.jsonPromise || this.fetchJson()
    return this.jsonPromise
  }

  async compileAll () {
    return Promise.all(allOutputTypes.map((outputType) => this.compile(outputType)))
  }

  async doCompile (outputType = defaultOutputType) {
    const json = await this.getJson()
    const result = await compileRendering({ rendering: json, outputType })
    const artifacts = []

    // using a raw rendering object is only for local dev, so don't publish the result
    if (['page', 'template'].includes(this.type)) {
      if (outputType && result.js) {
        artifacts.push(pushAsset(`${this.name}/${outputType}.js`, result.js, 'application/javascript'))
      }

      if (result.cssFile && result.css) {
        artifacts.push(pushAsset(result.cssFile, result.css, 'text/css'))
      }

      artifacts.push(pushCssHash(this.name, outputType, result.cssFile || null))
    }

    // we have to wait for artifacts to be pushed so the lambda isn't frozen
    await Promise.all(artifacts)
    return result
  }

  async compile (outputType = defaultOutputType) {
    debug(`get compilation: ${this.name}[${outputType}]`)
    this.compilations[outputType] = this.compilations[outputType] || this.doCompile(outputType)
    return this.compilations[outputType]
  }

  async getComponent ({ outputType = defaultOutputType, child, isAdmin }, quarantine) {
    debug(`get component: ${this.name}${child ? `(${child})` : ''}[${outputType}]`)
    this.contentCache = this.contentCache || {}
    this.inlines = this.inlines || {}
    return (child)
      ? getComponent({ rendering: this, outputType, isAdmin, quarantine, child })
      : getComponent({ rendering: this, outputType, isAdmin, quarantine, name: this.name })
  }

  async fetchContent (arcSite) {
    // I hate how this works, pulling content only for pages
    // but that's what you get with legacy data
    if (this.type === 'template') {
      return
    }

    const json = await this.getJson()
    const configs = json.globalContentConfig
    if (configs && configs.contentService && configs.contentConfigValues) {
      const source = await getSource(configs.contentService)
      const document = await source.fetch(
        Object.assign(
          json.uri
            ? { uri: json.uri }
            : {},
          { 'arc-site': arcSite },
          configs.contentConfigValues
        ),
        { followRedirect: false }
      )
      return {
        source: configs.contentService,
        query: configs.contentConfigValues,
        document
      }
    }
    return null
  }

  async getContent (arcSite) {
    this.contentPromise = this.contentPromise || this.fetchContent(arcSite)
    return this.contentPromise
  }

  async fetchCssFile (outputType = defaultOutputType) {
    const data = await fetchCssHash(this.name, outputType)
    // if not found, re-compile
    const { cssFile } = data || (await this.compile(outputType))
    return cssFile
  }

  async getCssFile (outputType = defaultOutputType) {
    debug(`get css file: ${this.name}[${outputType}]`)
    this.cssFilePromise = this.cssFilePromise || this.fetchCssFile(outputType)
    return this.cssFilePromise
  }

  async fetchStyles (outputType = defaultOutputType) {
    const cssFile = await this.getCssFile(outputType)
    try {
      return cssFile && await fetchAsset(cssFile)
    } catch (_) {
      const { css } = await this.compile(outputType)
      return css
    }
  }

  async getStyles (outputType = defaultOutputType) {
    debug(`get styles: ${this.name}[${outputType}]`)
    this.stylesPromise = this.stylesPromise || this.fetchStyles(outputType)
    return this.stylesPromise
  }

  async compileScript (outputType = defaultOutputType) {
    const { js } = await this.compile(outputType)
    return js
  }

  async getScript (outputType = defaultOutputType) {
    debug(`get script: ${this.name}[${outputType}]`)
    this.jsPromise = this.jsPromise || this.compileScript(outputType)
    return this.jsPromise
  }

  async publish (propagate) {
    const uri = `/dist/${this.type}/${this.id}`

    if (!this.json) {
      throw new Error('no rendering provided to publish')
    } else {
      await publishOutputTypes(uri, this.json, propagate ? 'RequestResponse' : 'Event')
      // if this is the first version to receive this rendering
      if (propagate) {
        const jsonPromise = putJson(this.type, Object.assign({}, this.json, { id: this.id }))
        try {
          await publishToOtherVersions(uri, this.json)
        } catch (e) {
          // do not throw while trying to publish to old versions
          console.error(e)
        }
        await jsonPromise
      }
    }
  }

  async render ({ content: templateContent, rendering, request }) {
    // template will already have content populated by resolver
    const content = templateContent || (await this.getContent(request.arcSite))

    const json = await this.getJson()
    this.jsonPromise = substitute(json, content.document)
    const Component = this.getComponent(rendering)

    try {
      return await render({ Component, content, request })
    } catch (_) {
      const Component = await this.getComponent(rendering, true)
      return render({ Component, content, request })
    }
  }

  static async compile (type) {
    const objects = await model(type).find()
    return Promise.all(
      objects.map(obj =>
        new Rendering(type, obj.id, obj).publish(false)
      )
    )
  }
}

module.exports = Rendering

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

  // Lazy load all the things (YpAGNI)

  async getJson () {
    this.jsonPromise = this.jsonPromise ||
      (
        (this.json)
          ? Promise.resolve(this.json)
          : getJson(this.type, this.id)
            .then(json => {
              if (!json) {
                const e = new Error(`No rendering found: ${this.type}/${this.id}`)
                e.statusCode = 404
                throw e
              }
              return json
            })
      )
    return this.jsonPromise
  }

  async compileAll () {
    return Promise.all(allOutputTypes.map((outputType) => this.compile(outputType)))
  }

  async compile (outputType = defaultOutputType) {
    debug(`get compilation: ${this.name}[${outputType}]`)
    this.compilations[outputType] = this.compilations[outputType] ||
      this.getJson()
        .then((json) => compileRendering({ rendering: json, outputType }))
        .then(({ js, css, cssFile }) => {
          const artifacts = []

          // using a raw rendering object is only for local dev, so don't publish the result
          if (['page', 'template'].includes(this.type)) {
            if (outputType && js) {
              artifacts.push(pushAsset(`${this.name}/${outputType}.js`, js, 'application/javascript'))
            }

            if (cssFile && css) {
              artifacts.push(pushAsset(cssFile, css, 'text/css'))
            }

            artifacts.push(pushCssHash(this.name, outputType, cssFile || null))
          }

          // we have to wait for artifacts to be pushed so the lambda isn't frozen
          return Promise.all(artifacts).then(() => ({ js, css, cssFile }))
        })
    return this.compilations[outputType]
  }

  async getComponent ({ outputType = defaultOutputType, child, isAdmin }, quarantine) {
    debug(`get component: ${this.name}${child ? `(${child})` : ''}[${outputType}]`)
    this.contentCache = this.contentCache || {}
    this.inlines = this.inlines || {}
    return (child)
      ? getComponent({ rendering: this, outputType, child, isAdmin, quarantine })
      : getComponent({ rendering: this, outputType, name: this.name, isAdmin, quarantine })
  }

  async getContent (arcSite) {
    // I hate how this works, pulling content only for pages
    // but that's what you get with legacy data
    this.contentPromise = this.contentPromise ||
      (
        (this.type === 'template')
          ? Promise.resolve()
          : this.getJson()
            .then((json) => {
              const configs = json.globalContentConfig
              return (configs && configs.contentService && configs.contentConfigValues)
                ? getSource(configs.contentService)
                  .then((source) => source.fetch(Object.assign(json.uri ? { uri: json.uri } : {}, { 'arc-site': arcSite }, configs.contentConfigValues)))
                  .then((document) => ({
                    source: configs.contentService,
                    key: configs.contentConfigValues,
                    document
                  }))
                : null
            })
      )
    return this.contentPromise
  }

  async getCssFile (outputType = defaultOutputType) {
    debug(`get css file: ${this.name}[${outputType}]`)
    this.cssFilePromise = this.cssFilePromise ||
      fetchCssHash(this.name, outputType)
        // if not found, re-compile
        .then((data) => data || this.compile(outputType))
        .then(({ cssFile }) => cssFile)
    return this.cssFilePromise
  }

  async getStyles (outputType = defaultOutputType) {
    debug(`get styles: ${this.name}[${outputType}]`)
    this.stylesPromise = this.stylesPromise ||
      this.getCssFile(outputType)
        .then((cssFile) => cssFile && fetchAsset(cssFile))
        .catch(() => this.compile(outputType).then(({ css }) => css))
    return this.stylesPromise
  }

  async getScript (outputType = defaultOutputType) {
    debug(`get script: ${this.name}[${outputType}]`)
    this.jsPromise = this.jsPromise ||
      this.compile(outputType).then(({ js }) => js)
    return this.jsPromise
  }

  async publish (propagate) {
    const uri = `/dist/${this.type}/${this.id}`
    return (
      (this.json)
        ? publishOutputTypes(uri, this.json, propagate ? 'RequestResponse' : 'Event')
          .then(
            // if this is the first version to receive this rendering
            (propagate)
              ? Promise.all([
                putJson(this.type, Object.assign({}, this.json, { id: this.id })),
                publishToOtherVersions(uri, this.json)
                  .catch((err) => {
                    // do not throw while trying to publish to old versions
                    console.error(err)
                  })
              ])
              : Promise.resolve()
          )
        : Promise.reject(new Error('no rendering provided to publish'))
    )
  }

  async render ({ content, rendering, request }) {
    return Promise.all([
      this.getComponent(rendering),
      content || this.getContent(request.arcSite)
    ])
      // template will already have content populated by resolver
      // use Object.assign to default to the resolver content
      .then(([Component, content]) =>
        Promise.resolve()
          .then(() => render({ Component, content, request }))
          .catch(() =>
            this.getComponent(rendering, true)
              .then((Component) => render({ Component, content, request }))
          )
      )
  }

  static async compile (type) {
    return model(type).find()
      .then(objects =>
        Promise.all(objects.map(obj => new Rendering(type, obj.id, obj).publish(false)))
      )
  }
}

module.exports = Rendering

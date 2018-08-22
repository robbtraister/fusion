'use strict'

const debug = require('debug')('fusion:models:rendering')

const {
  defaultOutputType,
  isDev,
  version
} = require('../../../environment')

const model = require('../../dao')

const compileRendering = require('./compile')
const getComponent = require('./component')
const {
  publishOutputTypes,
  publishToOtherVersions
} = require('./publish')

const getSource = require('../sources')

const {
  fetchFile,
  pushFile
} = require('../../assets/io')

// return the full object (not just cssFile value) because if it doesn't exist, we need to calculate it
// the calculation returns an object with a cssFile property
// for simplicity, we'll just unwrap that property from whatever we get
const fetchCssHash = (isDev)
  ? (name, outputType = defaultOutputType) => fetchFile(`${name}/${outputType}.css.json`)
    .then((json) => JSON.parse(json))
  : (name, outputType = defaultOutputType) => model('hash').get({version, id: `${name}/${outputType}`})

const pushCssHash = (isDev)
  ? (name, outputType = defaultOutputType, cssFile) => pushFile(`${name}/${outputType}.css.json`, JSON.stringify({cssFile}))
  : (name, outputType = defaultOutputType, cssFile) => model('hash').put({id: `${name}/${outputType}`, version, cssFile})

const getJson = (isDev)
  ? (type, id) => model(type).get(id)
    .then((data) => (type === 'rendering')
      ? data
      // if page/template, we need to get the actual rendering object
      : (() => {
        const version = data && data.published && data.versions && data.versions[data.published]
        const head = version && version.head
        return head && model('rendering').get(head)
      })()
    )
  : (type, id) => model(type).get(id)

const putJson = (isDev)
  // do nothing
  ? (type, json) => {}
  : (type, json) => model(type).put(json)

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

  async compile (outputType = defaultOutputType) {
    debug(`get compilation: ${this.name}[${outputType}]`)
    this.compilations[outputType] = this.compilations[outputType] ||
      this.getJson()
        .then((json) => compileRendering({rendering: json, outputType}))
        .then(({js, css, cssFile}) => {
          const artifacts = []

          // using a raw rendering object is only for local dev, so don't publish the result
          if (this.type !== 'rendering') {
            if (outputType && js) {
              artifacts.push(pushFile(`${this.name}/${outputType}.js`, js, 'application/javascript'))
            }

            if (cssFile && css) {
              artifacts.push(pushFile(cssFile, css, 'text/css'))
            }

            artifacts.push(pushCssHash(this.name, outputType, cssFile || null))
          }

          // we have to wait for artifacts to be pushed so the lambda isn't frozen
          return Promise.all(artifacts).then(() => ({js, css, cssFile}))
        })
    return this.compilations[outputType]
  }

  async getComponent (outputType = defaultOutputType, child) {
    debug(`get component: ${this.name}${child ? `(${child})` : ''}[${outputType}]`)
    if (child) {
      return getComponent({rendering: this, outputType, child})
    } else {
      this.componentPromise = this.componentPromise ||
        getComponent({rendering: this, outputType, name: this.name})
      return this.componentPromise
    }
  }

  async getContent (arcSite) {
    // I hate how this works, pulling content only for pages
    // but that's what you get with legacy data
    this.contentPromise = this.contentPromise ||
      (
        (this.type !== 'page')
          ? Promise.resolve()
          : this.getJson()
            .then((json) => {
              const configs = json.globalContentConfig
              return (!configs)
                ? null
                : getSource(configs.contentService)
                  .then((source) => source.fetch(Object.assign(json.uri ? {uri: json.uri} : {}, {'arc-site': arcSite}, configs.contentConfigValues)))
                  .then((document) => ({
                    source: configs.contentService,
                    key: configs.contentConfigValues,
                    document
                  }))
            })
      )
    return this.contentPromise
  }

  async getCssFile (outputType = defaultOutputType) {
    debug(`get css file: ${this.name}[${outputType}]`)
    this.cssFilePromise = this.cssFilePromise ||
      fetchCssHash(this.name, outputType)
        .catch(() => this.compile(outputType))
        .then(({cssFile}) => cssFile)
    return this.cssFilePromise
  }

  async getStyles (outputType = defaultOutputType) {
    debug(`get styles: ${this.name}[${outputType}]`)
    this.stylesPromise = this.stylesPromise ||
      this.getCssFile(outputType)
        .then((cssFile) => fetchFile(cssFile))
        .catch(() => this.compile(outputType).then(({css}) => css))
    return this.stylesPromise
  }

  async getScript (outputType = defaultOutputType) {
    debug(`get script: ${this.name}[${outputType}]`)
    this.jsPromise = this.jsPromise ||
      this.compile(outputType).then(({js}) => js)
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
                putJson(this.type, Object.assign({}, this.json, {id: this.id})),
                publishToOtherVersions(uri, this.json)
              ])
              : Promise.resolve()
          )
        : Promise.reject(new Error('no rendering provided to publish'))
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

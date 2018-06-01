'use strict'

const debug = require('debug')('fusion:models:rendering')

const {
  defaultOutputType,
  isDev,
  version
} = require('../../../environment')

const model = (isDev)
  ? require('../../dao/mongo')
  : require('../../dao/dynamoose')

const Hash = model('hash')

const compileRendering = require('./compile')
const getComponent = require('./component')
const {
  publishToOtherVersions
} = require('./publish')

const {
  getOutputTypes
} = require('../../assets/info')

const {
  fetchFile,
  pushFile
} = require('../../assets/io')

const fetchCssFile = (isDev)
  ? (name, outputType = defaultOutputType) => fetchFile(`${name}/${outputType}.css.json`)
    .then((json) => JSON.parse(json))
  : (name, outputType = defaultOutputType) => Hash.get(`${name}/${outputType}/${version}`)

const pushCssFile = (isDev)
  ? (name, outputType = defaultOutputType, cssFile) => pushFile(`${name}/${outputType}.css.json`, JSON.stringify({cssFile}))
  : (name, outputType = defaultOutputType, cssFile) => Hash.put({id: `${name}/${outputType}/${version}`, version, cssFile})

const getJson = (isDev)
  ? (type, id) => model(type).get(id)
    .then((data) => (type === 'rendering')
      ? data
      : model('rendering').get(data.versions[data.published].head)
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

  getJson () {
    this.json = this.json || getJson(this.type, this.id)
    return this.json
  }

  compile (outputType = defaultOutputType) {
    debug(`get compilation: ${this.name}[${outputType}]`)
    this.compilations[outputType] = this.compilations[outputType] ||
      this.getJson()
        .then((json) => compileRendering({name: this.name, rendering: json, outputType}))
        .then(({js, css, cssFile}) => {
          if (this.type !== 'rendering') {
            if (outputType && js) {
              pushFile(`${this.name}/${outputType}.js`, js, 'application/javascript')
            }

            if (cssFile && css) {
              pushFile(cssFile, css, 'text/css')
              pushCssFile(this.name, outputType, cssFile)
            }
          }

          return {js, css, cssFile}
        })
    return this.compilations[outputType]
  }

  compileAll () {
    return getOutputTypes()
      .then((outputTypes) => Promise.all(outputTypes.map(outputType => this.compile(outputType))))
  }

  getComponent (outputType = defaultOutputType, child) {
    debug(`get component: ${this.name}${child ? `(${child})` : ''}[${outputType}]`)
    this.component = this.component ||
      (
        (child)
          ? getComponent({rendering: this, outputType, child})
          : getComponent({rendering: this, outputType, name: this.name})
      )
    return this.component
  }

  getCssFile (outputType = defaultOutputType) {
    debug(`get css file: ${this.name}[${outputType}]`)
    this.cssFile = this.cssFile ||
      fetchCssFile(this.name, outputType)
        .catch(() => this.compile(outputType))
        .then(({cssFile}) => cssFile)
    return this.cssFile
  }

  getStyles (outputType = defaultOutputType) {
    debug(`get styles: ${this.name}[${outputType}]`)
    this.css = this.css ||
      this.getCssFile(outputType)
        .then((cssFile) => fetchFile(cssFile))
        .catch(() => this.compile(outputType).then(({css}) => css))
    return this.css
  }

  getScript (outputType = defaultOutputType) {
    debug(`get script: ${this.name}[${outputType}]`)
    this.js = this.js ||
      this.compile(outputType).then(({js}) => js)
    return this.js
  }

  publish () {
    return (
      (this.json)
        ? Promise.all([
          putJson(this.type, this.json),
          this.compileAll()
        ])
        : Promise.reject(new Error('no rendering provided to publish'))
    )
      .then(() => publishToOtherVersions(`/dist/${this.type}/${this.id}`, this.json))
  }
}

module.exports = Rendering

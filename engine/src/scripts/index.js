'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const S3 = require('aws-sdk').S3
const zlib = require('zlib')

const pack = require('../react/server/compile/pack')

const {
  findRenderableItem
} = require('../models/renderings')

const s3 = new S3({region: 'us-east-1'})

const {
  context,
  environment,
  isDev,
  version
} = require('../environment')

const getEnvironment = function getEnvironment () {
  return environment
}

const getVersion = function getVersion () {
  return version
}

const getScriptBucket = function getScriptBucket () {
  return 'pagebuilder-fusion'
}

const getScriptKey = function getScriptKey (pt) {
  return (pt.uri)
    ? `page/${pt.uri.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
    : `template/${pt._id.replace(/^\/*/, '').replace(/\/*$/, '')}.js`
}

const getScriptUri = function getScriptUri (pt) {
  return `${context}/dist/${getScriptKey(pt)}`
}

const getScriptUrl = function getScriptUrl (pt) {
  return `https://${getScriptBucket()}.s3.amazonaws.com/${getEnvironment()}/${getVersion()}/dist/${getScriptKey(pt)}`
}

const uploadScript = function uploadScript (key, src) {
  return (isDev)
    ? (() => {
      const filePath = path.resolve(`${__dirname}/../../dist/${key}`)
      return new Promise((resolve, reject) => {
        childProcess.exec(`mkdir -p ${path.dirname(filePath)}`, (err) => {
          err ? reject(err) : resolve()
        })
      })
        .then(() => new Promise((resolve, reject) => {
          fs.writeFile(`${__dirname}/../../dist/${key}`, src, (err) => {
            err ? reject(err) : resolve()
          })
        }))
    })()
    : new Promise((resolve, reject) => {
      zlib.gzip(src, (err, buf) => {
        err ? reject(err) : resolve(buf)
      })
    }).then((buf) => new Promise((resolve, reject) => {
      s3.upload({
        Bucket: getScriptBucket(),
        Key: `${getEnvironment()}/${getVersion()}/dist/${key}`,
        Body: buf,
        ACL: 'public-read',
        ContentType: 'application/javascript',
        ContentEncoding: 'gzip'
      }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    }))
}

const compile = function compile ({pt, rendering, outputType, child, useComponentLib}) {
  const {renderable, uploadCss, uploadJs} = (child)
    ? {
      renderable: findRenderableItem(rendering)(child),
      // if this is a child feature, do not upload
      uploadCss: () => Promise.resolve(),
      uploadJs: () => Promise.resolve()
    }
    : (pt && !useComponentLib)
      ? {
        renderable: rendering,
        uploadCss: (name, src) => uploadScript(name, src),
        uploadJs: (name, src) => uploadScript(name, src)
      }
      : {
        renderable: rendering,
        // admin request, do not upload
        uploadCss: () => Promise.resolve(),
        uploadJs: () => Promise.resolve()
      }

  const parts = path.parse(getScriptKey(pt))
  const name = path.join(parts.dir, parts.name)

  return pack({name, renderable, outputType, useComponentLib})
    .then(({src, css, cssFile}) => {
      if (isDev && !useComponentLib) {
        src += `;Fusion.Template.css=\`${css.replace('`', '\\`')}\``
      }
      return Promise.all([
        uploadCss(cssFile, css),
        uploadJs(`${name}.js`, src)
      ])
        .then(() => src)
    })
}

module.exports = {
  compile,
  getScriptUri,
  getScriptUrl,
  getVersion,
  uploadScript
}

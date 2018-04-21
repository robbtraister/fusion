'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const S3 = require('aws-sdk').S3
const zlib = require('zlib')

const pack = require('../react/server/compile/pack')

const {
  getBucket,
  getOutputType,
  getScriptKey
} = require('./info')

const { isDev } = require('../environment')

const {
  findRenderableItem,
  getPage,
  getRendering,
  getTemplate
} = require('../models/renderings')

const {
  compileDocument,
  compileRenderable
} = require('../react/server/render')

const s3 = new S3({region: 'us-east-1'})

const fetchRendering = (componentType) => {
  const {fetchJson, field} = {
    page: {
      fetchJson: getPage,
      field: 'uri'
    },
    rendering: {
      fetchJson: getRendering,
      field: 'id'
    },
    template: {
      fetchJson: getTemplate,
      field: 'id'
    }
  }[componentType]

  return (payload) => {
    const id = payload[field].replace(/^\/*/, '').replace(/\/*$/, '')
    const outputType = getOutputType(payload.outputType)

    return new Promise((resolve, reject) => {
      fs.readFile(`${__dirname}/../../dist/${componentType}/${id}/${outputType}.json`, (err, data) => {
        err ? reject(err) : resolve({id, rendering: JSON.parse(data.toString())})
      })
    })
      .catch(() => fetchJson({[field]: id}).then(({rendering}) => ({id, rendering})))
      .catch(() => { throw new Error('Did not recognize componentType') })
  }
}

const getComponent = (componentType) => {
  const fetch = fetchRendering(componentType)

  return (payload) => fetch(payload)
    .then(({rendering, id}) => {
      const renderable = (payload.child)
        ? findRenderableItem(rendering)(payload.child)
        : rendering

      return (payload.child)
        ? compileRenderable({renderable, outputType: payload.outputType})
        : compileDocument({renderable, outputType: payload.outputType, name: `${componentType}/${id}`})
    })
}

const uploadScript = function uploadScript (name, src) {
  return (isDev)
    ? (() => {
      const filePath = path.resolve(`${__dirname}/../../dist/${name}`)
      return new Promise((resolve, reject) => {
        childProcess.exec(`mkdir -p ${path.dirname(filePath)}`, (err) => {
          err ? reject(err) : resolve()
        })
      })
        .then(() => new Promise((resolve, reject) => {
          fs.writeFile(`${__dirname}/../../dist/${name}`, src, (err) => {
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
        Bucket: getBucket(),
        Key: `${getScriptKey(name)}`,
        Body: buf,
        ACL: 'public-read',
        ContentType: 'application/javascript',
        ContentEncoding: 'gzip'
      }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    }))
}

const compile = function compile ({name, rendering, outputType, child, useComponentLib}) {
  const {renderable, upload} = (child)
    ? {
      renderable: findRenderableItem(rendering)(child),
      // if this is a child feature, do not upload
      upload: () => Promise.resolve()
    }
    : (name && !useComponentLib)
      ? {
        renderable: rendering,
        upload: uploadScript
      }
      : {
        renderable: rendering,
        // admin request, do not upload
        upload: () => Promise.resolve()
      }

  return pack({renderable, outputType, useComponentLib})
    .then(({src, css, cssFile}) => {
      src = src.replace(/;*$/, `;Fusion.Template.cssFile='${name}/${cssFile}'`)
      return Promise.all([
        upload(`${name}/${cssFile}`, css),
        upload(`${name}/${getOutputType(outputType)}.js`, src),
        upload(`${name}/${getOutputType(outputType)}.json`, JSON.stringify(Object.assign({}, rendering, {cssFile: `${name}/${cssFile}`})))
      ])
        .then(() => src)
    })
}

module.exports = {
  compile,
  fetchRendering,
  getComponent,
  uploadScript
}

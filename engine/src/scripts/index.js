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
  getScriptKey,
  getS3Key
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

const fetchFromFS = ({componentType, id, outputType}) => {
  const fp = path.resolve(`${__dirname}/../../dist/${componentType}/${id}/${getOutputType(outputType)}.json`)
  return new Promise((resolve, reject) => {
    fs.readFile(fp, (err, data) => {
      err ? reject(err) : resolve({id, rendering: JSON.parse(data.toString())})
    })
  })
}

const fetchFromS3 = ({componentType, id, outputType}) => {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: getBucket(),
      Key: `${getS3Key({componentType, id, outputType})}`
    }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .then((src) => new Promise((resolve, reject) => {
      zlib.gunzip(src, (err, buf) => {
        err ? reject(err) : resolve({id, rendering: JSON.parse(buf.toString())})
      })
    }))
}

const fetchFile = (isDev) ? fetchFromFS : fetchFromS3

const fetchRendering = (componentType) => {
  const fetchRecord = {
    page: getPage,
    rendering: getRendering,
    template: getTemplate
  }[componentType]

  return (payload) => {
    const id = payload.id
    const outputType = getOutputType(payload.outputType)

    return fetchFile({componentType, id, outputType})
      .catch(() => fetchRecord({id}).then(({rendering}) => ({id, rendering})))
      .catch(() => { throw new Error('Did not recognize componentType') })
  }
}

const getComponent = (componentType) => {
  const fetchType = fetchRendering(componentType)

  return (payload) => fetchType(payload)
    .then(({rendering, id}) => {
      const renderable = (payload.child)
        ? findRenderableItem(rendering)(payload.child)
        : rendering

      return (payload.child)
        ? compileRenderable({renderable, outputType: payload.outputType})
        : compileDocument({renderable, outputType: payload.outputType, name: `${componentType}/${id}`})
    })
}

const uploadToFs = function uploadToFs (name, src) {
  const filePath = path.resolve(`${__dirname}/../../dist/${name}`)
  return new Promise((resolve, reject) => {
    childProcess.exec(`mkdir -p ${path.dirname(filePath)}`, (err) => {
      err ? reject(err) : resolve()
    })
  })
    .then(() => new Promise((resolve, reject) => {
      fs.writeFile(filePath, src, (err) => {
        err ? reject(err) : resolve()
      })
    }))
}

const uploadToS3 = function uploadToS3 (name, src) {
  return new Promise((resolve, reject) => {
    zlib.gzip(src, (err, buf) => {
      err ? reject(err) : resolve(buf)
    })
  })
    .then((buf) => new Promise((resolve, reject) => {
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

const upload = (isDev) ? uploadToFs : uploadToS3

const compile = function compile ({name, rendering, outputType, child, useComponentLib}) {
  const renderable = (child)
    ? findRenderableItem(rendering)(child)
    : rendering

  return pack({renderable, outputType, useComponentLib})
    .then(({src, css, cssFile}) => {
      src = src.replace(/;*$/, `;Fusion.Template.cssFile='${name}/${cssFile}'`)
      return (
        (name && !child && !useComponentLib)
          ? Promise.all([
            upload(`${name}/${cssFile}`, css),
            upload(`${name}/${getOutputType(outputType)}.js`, src),
            upload(`${name}/${getOutputType(outputType)}.json`, JSON.stringify(Object.assign({}, rendering, {cssFile: `${name}/${cssFile}`})))
          ])
          : Promise.resolve()
      )
        .then(() => src)
    })
}

module.exports = {
  compile,
  fetchRendering,
  getComponent
}

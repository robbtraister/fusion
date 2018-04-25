'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const S3 = require('aws-sdk').S3

const s3 = new S3({region: 'us-east-1'})

const {
  getBucket,
  getS3Key
} = require('./info')

const {
  distRoot,
  isDev
} = require('../environment')

const {
  getPage,
  getRendering,
  getTemplate
} = require('../models/renderings')

const fetchFromFS = (name) => {
  const fp = path.resolve(`${distRoot}/${name}`)
  return new Promise((resolve, reject) => {
    fs.readFile(fp, (err, data) => {
      err ? reject(err) : resolve(data.toString())
    })
  })
}

const fetchFromS3 = (name) => {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: getBucket(),
      Key: `${getS3Key(name)}`
    }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
    .then((src) => new Promise((resolve, reject) => {
      zlib.gunzip(src, (err, buf) => {
        err ? reject(err) : resolve(buf.toString())
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

    return fetchFile(`${componentType}/${id}/rendering.json`)
      .then((source) => ({rendering: JSON.parse(source)}))
      .catch(() => fetchRecord({id}))
      .then(({rendering}) => ({id, rendering}))
      .catch(() => { throw new Error(`Did not recognize component type: ${componentType}`) })
  }
}

const pushToFs = function pushToFs (name, src) {
  const filePath = path.resolve(`${distRoot}/${name}`)
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

const pushToS3 = function pushToS3 (name, src, ContentType) {
  return new Promise((resolve, reject) => {
    zlib.gzip(src, (err, buf) => {
      err ? reject(err) : resolve(buf)
    })
  })
    .then((buf) => new Promise((resolve, reject) => {
      s3.upload({
        Bucket: getBucket(),
        Key: `${getS3Key(name)}`,
        Body: buf,
        ACL: 'public-read',
        ContentType,
        ContentEncoding: 'gzip'
      }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    }))
}

const pushFile = (isDev) ? pushToFs : pushToS3

module.exports = {
  fetchFile,
  fetchRendering,
  pushFile
}

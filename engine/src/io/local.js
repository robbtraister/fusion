'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const model = require('../dao')

const {
  bundleDistRoot,
  bundleHtmlRoot,
  defaultOutputType
} = require('../../environment')

// return the full object (not just cssFile value) because if it doesn't exist, we need to calculate it
// the calculation returns an object with a cssFile property
// for simplicity, we'll just unwrap that property from whatever we get
const fetchCssHash = async (name, outputType = defaultOutputType) =>
  fetchAsset(path.join(name, `${outputType}.css.json`))
    .then((json) => JSON.parse(json))
    .catch(() => null)

const pushCssHash = async (name, outputType = defaultOutputType, cssFile) =>
  pushAsset(path.join(name, `${outputType}.css.json`), JSON.stringify({cssFile}))

const getJson = (type, id) => model(type).get(id)
  .then((data) => (type === 'rendering')
    ? data
    // if page/template, we need to get the actual rendering object
    : (() => {
      const version = data && data.published && data.versions && data.versions[data.published]
      const head = version && version.head
      return head && model('rendering').get(head)
    })()
  )

// do nothing
const putJson = (type, json) => {}

const fetchFile = async (filePath) =>
  new Promise((resolve, reject) =>
    fs.readFile(
      filePath,
      (err, data) => (err) ? reject(err) : resolve(data.toString())
    )
  )

const pushFile = async (filePath, src) =>
  new Promise((resolve, reject) =>
    childProcess.exec(
      `mkdir -p ${path.dirname(filePath)}`,
      (err) => err ? reject(err) : resolve()
    )
  )
    .then(() =>
      new Promise((resolve, reject) =>
        fs.writeFile(
          filePath,
          src,
          (err) => (err) ? reject(err) : resolve()
        )
      )
    )

const fetchAsset = async (name) =>
  fetchFile(path.join(bundleDistRoot, name))

const pushAsset = async (name, src) =>
  pushFile(path.join(bundleDistRoot, name), src)

// unused on local
// const pushHtml = async () => Promise.resolve()

const pushHtml = async (name, src) =>
  pushFile(path.join(bundleHtmlRoot, name), src)

const pushResolvers = async () => Promise.resolve()

module.exports = {
  fetchAsset,
  fetchCssHash,
  getJson,
  pushAsset,
  pushCssHash,
  pushHtml,
  pushResolvers,
  putJson
}

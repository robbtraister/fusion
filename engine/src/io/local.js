'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const model = require('../dao')

const {
  bundleBuildRoot,
  defaultOutputType
} = require('../../environment')

const fetchFile = async function fetchFile (filePath) {
  return new Promise((resolve, reject) =>
    fs.readFile(
      filePath,
      (err, data) => (err) ? reject(err) : resolve(data.toString())
    )
  )
}

const pushFile = async function pushFile (filePath, src) {
  await new Promise((resolve, reject) =>
    childProcess.exec(
      `mkdir -p ${path.dirname(filePath)}`,
      (err) => err ? reject(err) : resolve()
    )
  )
  return new Promise((resolve, reject) =>
    fs.writeFile(
      filePath,
      src,
      (err) => (err) ? reject(err) : resolve()
    )
  )
}

const fetchAsset = async function fetchAsset (name) {
  return fetchFile(path.join(bundleBuildRoot, name))
}
const pushAsset = async function pushAsset (name, src) {
  return pushFile(path.join(bundleBuildRoot, name), src)
}

// return the full object (not just cssFile value) because if it doesn't exist, we need to calculate it
// the calculation returns an object with a cssFile property
// for simplicity, we'll just unwrap that property from whatever we get
const fetchCssHash = async function fetchCssHash (name, outputType = defaultOutputType) {
  try {
    return JSON.parse(await fetchAsset(path.join(name, `${outputType}.css.json`)))
  } catch (e) {
    return null
  }
}

const pushCssHash = async function pushCssHash (name, outputType = defaultOutputType, cssFile) {
  return pushAsset(path.join(name, `${outputType}.css.json`), JSON.stringify({ cssFile }))
}

// unused on local
const pushHtml = async () => Promise.resolve()

const getJson = async function getJson (type, id) {
  const data = await model(type).get(id)

  if (type === 'rendering') {
    return data
  }

  // if page/template, we need to get the actual rendering object
  const version = data && data.published && data.versions && data.versions[data.published]
  const head = version && version.head
  if (head) {
    const rendering = await model('rendering').get(head)
    rendering.id = rendering._pt
    return rendering
  }
}

// unused on local
const putJson = (type, json) => {}

// unused on local
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

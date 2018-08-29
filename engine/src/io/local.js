'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

const model = require('../dao')

const {
  bundleDistRoot,
  defaultOutputType
} = require('../../environment')

// return the full object (not just cssFile value) because if it doesn't exist, we need to calculate it
// the calculation returns an object with a cssFile property
// for simplicity, we'll just unwrap that property from whatever we get
const fetchCssHash = async (name, outputType = defaultOutputType) =>
  fetchFile(`${name}/${outputType}.css.json`)
    .then((json) => JSON.parse(json))
    .catch(() => null)

const pushCssHash = async (name, outputType = defaultOutputType, cssFile) =>
  pushFile(`${name}/${outputType}.css.json`, JSON.stringify({cssFile}))

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

const fetchFile = async function fetchFile (name) {
  const fp = path.resolve(bundleDistRoot, name)
  return new Promise((resolve, reject) => {
    fs.readFile(fp, (err, data) => {
      err ? reject(err) : resolve(data.toString())
    })
  })
}

const pushFile = async function pushFile (name, src) {
  const filePath = path.resolve(`${bundleDistRoot}/${name}`)
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

// const pushResolvers = async () => pushFile('resolvers.json')

// the above is unnecessary; resolver just reads from db
const pushResolvers = async () => Promise.resolve()

module.exports = {
  fetchCssHash,
  fetchFile,
  getJson,
  pushCssHash,
  pushFile,
  pushResolvers,
  putJson
}

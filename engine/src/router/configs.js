'use strict'

const path = require('path')

const express = require('express')

const { glob } = require('../utils/promises')

const JGE = require('../models/sources/jge')

const {
  componentDistRoot,
  isDev,
  schemasRoot,
  sourcesRoot
} = require('../../environment')

const loadConfigs = require('../configs')

const getConfigs = (type) => {
  try {
    return require(`${componentDistRoot}/${type}/fusion.configs.json`)
  } catch (e) {
    return loadConfigs(type)
  }
}

const getConfigHandler = (type) => {
  return (isDev)
    ? (req, res, next) => {
      res.send(getConfigs(type))
    }
    : (() => {
      const configs = getConfigs(type)
      return (req, res, next) => {
        res.send(configs)
      }
    })()
}
const configRouter = express.Router()

configRouter.get('/chains', getConfigHandler('chains'))
configRouter.get('/features', getConfigHandler('features'))
configRouter.get('/layouts', getConfigHandler('layouts'))
configRouter.get('/output-types', getConfigHandler('output-types'))

function transformContentConfigs (manifest) {
  // if (manifest.pattern) {
  //   const idMatcher = /\{([^}])\}/g
  //   const ids = []
  //   while (const id = idMatcher.exec(manifest.pattern)) {
  //     ids.push(id)
  //   }
  // }
  return {
    service: manifest.service,
    config: manifest.content || manifest.config || manifest.schemaName,
    paramFields: manifest.params
  }
}

configRouter.get('/content/sources', (req, res, next) => {
  Promise.all([
    glob('**/*', {cwd: sourcesRoot})
      .then(sources => sources.map(s => ({service: path.parse(s).name}))),
    JGE.find()
      .then(sources => sources.map(s => {
        s.service = s._id
        delete s._id
        return s
      }))
  ])
    .then(([bundleSources, jgeSources]) => {
      const bundleIds = bundleSources.map(s => s.service)
      return bundleSources.concat(jgeSources.filter(jge => !bundleIds.includes(jge.service)))
    })
    .then(sources => sources.map(transformContentConfigs))
    .then(sources => res.send(sources))
})

configRouter.get('/content/schemas', (req, res, next) => {
  glob('**/*', {cwd: schemasRoot})
    .then(schemas => Object.assign(...schemas.map(s => {
      const id = path.parse(s).name
      return {[id]: id}
    })))
    .then(schemas => res.send({schemas}))
})

module.exports = configRouter

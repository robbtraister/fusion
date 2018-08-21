'use strict'

const path = require('path')

const express = require('express')

const { glob } = require('../utils/promises')

const getSource = require('../models/sources')

const {
  componentDistRoot,
  isDev,
  schemasDistRoot,
  sourcesDistRoot
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

function getPatternParams (p) {
  const idMatcher = /\{([^}]+)\}/g
  const result = []
  while (true) {
    const key = idMatcher.exec(p)
    if (key) {
      result.push(key[1])
    } else {
      break
    }
  }
  return result
}

function transformContentConfigs (manifest) {
  const idFields = (manifest.pattern)
    ? getPatternParams(manifest.pattern)
      .map((key) => ({key, type: 'text'}))
    : null

  return {
    service: manifest.service || manifest.name,
    config: manifest.content || manifest.config || manifest.schemaName,
    idFields: idFields || [],
    paramFields: manifest.params || []
  }
}

configRouter.get('/content/sources', (req, res, next) => {
  glob('**/*', {cwd: sourcesDistRoot})
    .then(sources => Promise.all(
      sources.map(s =>
        getSource(path.parse(s).name)
          .catch(() => null)
      )
    ))
    .then(sources => sources.filter(s => s))
    .then(sources => sources.map(transformContentConfigs))
    .then(sources => res.send(sources))
})

configRouter.get('/content/schemas', (req, res, next) => {
  glob('**/*', {cwd: schemasDistRoot})
    .then(schemas => Object.assign(...schemas.map(s => {
      const id = path.parse(s).name
      return {[id]: id}
    })))
    .then(schemas => res.send({schemas}))
})

module.exports = configRouter

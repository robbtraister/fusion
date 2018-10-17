'use strict'

const express = require('express')

const getSource = require('../models/sources')

const {
  componentDistRoot,
  contentDistRoot,
  isDev
} = require('../../environment')

const loadComponentConfigs = require('../configs/components')

const getContentManifest = (collection) => {
  try {
    return require(`${contentDistRoot}/${collection}/fusion.manifest.json`)
  } catch (e) {
    return {}
  }
}

const getConfigs = (collection) => {
  try {
    return require(`${componentDistRoot}/${collection}/fusion.configs.json`)
  } catch (e) {
    return loadComponentConfigs(collection)
  }
}

const filterConfigs = (configs, id) => {
  id = id && id.toLowerCase().replace(/\/+$/, '')
  return (id)
    ? configs.find((config) => config.id.toLowerCase() === id)
    : configs
}

const getConfigHandler = (collection) => {
  return (isDev)
    ? (req, res, next) => {
      const configs = getConfigs(collection)
      res.send(filterConfigs(configs, req.params[0]))
    }
    : (() => {
      const configs = getConfigs(collection)
      return (req, res, next) => {
        res.send(filterConfigs(configs, req.params[0]))
      }
    })()
}
const configRouter = express.Router()

configRouter.get(/\/chains(?:\/(.*))?/, getConfigHandler('chains'))
configRouter.get(/\/features(?:\/(.*))?/, getConfigHandler('features'))
configRouter.get(/\/layouts(?:\/(.*))?/, getConfigHandler('layouts'))
configRouter.get(/\/output-types(?:\/(.*))?/, getConfigHandler('output-types'))

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
      .map((key) => ({ key, type: 'text' }))
    : null

  return {
    service: manifest.service || manifest.name,
    config: manifest.content || manifest.config || manifest.schemaName,
    idFields: idFields || [],
    paramFields: manifest.params || []
  }
}

configRouter.get('/content/sources',
  async (req, res, next) => {
    try {
      const sourceManifest = getContentManifest('sources')
      const sources = await Promise.all(
        Object.keys(sourceManifest)
          .map((sourceName) =>
            getSource(sourceName)
              .catch(() => null)
          )
      )

      res.send(
        sources
          .filter(source => source)
          .map(transformContentConfigs)
      )
    } catch (e) {
      next(e)
    }
  }
)

configRouter.get('/content/schemas',
  (req, res, next) => {
    try {
      const schemaManifest = getContentManifest('schemas')

      const schemas = Object.assign(
        ...Object.keys(schemaManifest)
          .map((schemaName) => ({ [schemaName]: schemaName }))
      )

      res.send(schemas)
    } catch (e) {
      next(e)
    }
  }
)

module.exports = configRouter

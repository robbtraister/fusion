'use strict'

const express = require('express')

const {
  componentDistRoot,
  contentDistRoot,
  isDev
} = require('../../environment')

const loadComponentConfigs = require('../configs/components')

const getConfigs = (configRoot, collection) => {
  try {
    return require(`${configRoot}/${collection}/fusion.configs.json`)
  } catch (e) {
    return loadComponentConfigs(collection)
  }
}

const filterConfigs = (configs, id, idField = 'id') => {
  id = id && id.toLowerCase().replace(/\/+$/, '')
  return (id)
    ? configs.find((config) => config[idField].toLowerCase() === id)
    : configs
}

const getConfigHandler = (configRoot, collection, idField) => {
  return (isDev)
    ? (req, res, next) => {
      const configs = getConfigs(configRoot, collection)
      res.send(filterConfigs(configs, req.params[0], idField))
    }
    : (() => {
      const configs = getConfigs(configRoot, collection)
      return (req, res, next) => {
        res.send(filterConfigs(configs, req.params[0], idField))
      }
    })()
}

const configRouter = express.Router()

configRouter.get(/\/chains(?:\/(.*))?/, getConfigHandler(componentDistRoot, 'chains'))
configRouter.get(/\/features(?:\/(.*))?/, getConfigHandler(componentDistRoot, 'features'))
configRouter.get(/\/layouts(?:\/(.*))?/, getConfigHandler(componentDistRoot, 'layouts'))
configRouter.get(/\/output-types(?:\/(.*))?/, getConfigHandler(componentDistRoot, 'output-types'))

configRouter.get(/\/content\/schemas(?:\/(.*))?/, getConfigHandler(contentDistRoot, 'schemas'))
configRouter.get(/\/content\/sources(?:\/(.*))?/, getConfigHandler(contentDistRoot, 'sources', 'service'))

module.exports = configRouter

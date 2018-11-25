'use strict'

const path = require('path')

const express = require('express')

const filterConfigs = (configs, id, idField = 'id') => {
  id = id && id.toLowerCase().replace(/\/+$/, '')
  return (id)
    ? configs.find((config) => config[idField].toLowerCase() === id)
    : configs
}

module.exports = ({ distRoot }) => {
  const getConfigHandler = (section, collection, idField) => {
    let configs
    try {
      configs = require(path.resolve(distRoot, 'configs', section, `${collection}.json`))
    } catch (err) {
      console.error(err)
      // no-op
    }

    return (req, res, next) => {
      res.send(filterConfigs(configs, req.params[0], idField))
    }
  }

  const configRouter = express.Router()

  // configRouter.get(/\/chains(?:\/(.*))?/, getConfigHandler('components', 'chains'))
  // configRouter.get(/\/features(?:\/(.*))?/, getConfigHandler('components', 'features'))
  // configRouter.get(/\/layouts(?:\/(.*))?/, getConfigHandler('components', 'layouts'))
  // configRouter.get(/\/output-types(?:\/(.*))?/, getConfigHandler('components', 'output-types'))

  configRouter.get(/\/content\/schemas(?:\/(.*))?/, getConfigHandler('content', 'schemas'))
  configRouter.get(/\/content\/sources(?:\/(.*))?/, getConfigHandler('content', 'sources', 'service'))

  return configRouter
}

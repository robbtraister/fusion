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

const FIELD_TYPE_MAP = {
  // react-prop-type: pb-classic-field-type
  'bool': 'boolean',
  'oneOf': 'select',
  'string': 'text',
  'number': 'number'
}

function transformCustomFields (customFields) {
  return (customFields)
    ? Object.keys(customFields)
      .map(id => {
        const customField = customFields[id]
        const typeInfo = customField.type.split('.')
        const fieldType = FIELD_TYPE_MAP[typeInfo[0]] || 'text'
        const options = (fieldType === 'select')
          ? {
            selectOptions: customField.args
          }
          : {}
        return Object.assign(
          {},
          customField.tags || {},
          {
            id,
            fieldType,
            isRequired: typeInfo.length > 1 && typeInfo[typeInfo.length - 1] === 'isRequired'
          },
          options
        )
      })
    : null
}

function transformComponentConfigs (manifest) {
  return Object.keys(manifest)
    .map(id => ({
      id,
      customFields: transformCustomFields(manifest[id].customFields) || []
    }))
}

function componentConfigHandler (type) {
  const manifestFile = `${componentDistRoot}/${type}/fusion.manifest.json`
  const loadManifest = () => transformComponentConfigs(require(manifestFile))
  return (isDev)
    ? (req, res, next) => {
      // in dev mode, always reload the latest in case webpack has recompiled
      delete require.cache[manifestFile]
      res.send(loadManifest())
    }
    : (() => {
      const configs = loadManifest()
      return (req, res, next) => {
        res.send(configs)
      }
    })()
}

const configRouter = express.Router()

configRouter.get('/chains', componentConfigHandler('chains'))
configRouter.get('/features', componentConfigHandler('features'))
configRouter.get('/layouts', componentConfigHandler('layouts'))
configRouter.get('/output-types', componentConfigHandler('output-types'))

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

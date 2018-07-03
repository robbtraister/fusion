'use strict'

const path = require('path')

const express = require('express')

const { glob } = require('../utils/promises')

const JGE = require('../models/sources/jge')

const {
  schemasRoot,
  sourcesRoot
} = require('../../environment')

const {
  components
} = require('../../environment/bundle')

const handler = (componentManifest) =>
  (req, res, next) => {
    res.send(
      Object.keys(componentManifest)
        .map(key => componentManifest[key])
    )
  }

const configRouter = express.Router()

configRouter.get('/chains', handler(components.chains))
configRouter.get('/features', handler(components.features))
configRouter.get('/layouts', handler(components.layouts))
configRouter.get('/output-types', handler(components.outputTypes))

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

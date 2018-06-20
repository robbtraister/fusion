'use strict'

const path = require('path')

const express = require('express')

const { glob } = require('../utils/promises')

const JGE = require('../models/sources/jge')

const {
  componentDistRoot,
  schemasRoot,
  sourcesRoot
} = require('../../environment')

const componentManifest = `${componentDistRoot}/manifest.components.json`
const outputTypeManifest = `${componentDistRoot}/manifest.output-types.json`

const handler = (type, manifestFile) =>
  (req, res, next) => {
    res.send(
      Object.values(
        require(manifestFile)
      )
        .filter(f => f.startsWith(`${type}/`))
        .filter(f => f.endsWith('.js'))
        .map(f => ({id: f.substring(type.length + 1, f.length - 3)}))
    )
  }

const configRouter = express.Router()

configRouter.get('/chains', handler('chains', componentManifest))
configRouter.get('/features', handler('features', componentManifest))
configRouter.get('/layouts', handler('layouts', componentManifest))
configRouter.get('/output-types', handler('output-types', outputTypeManifest))

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

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
    res.send({
      [type]: Object.values(
        require(manifestFile)
      )
        .filter(f => f.startsWith(`${type}/`))
        .filter(f => f.endsWith('.js'))
        .map(f => ({id: f.substring(type.length + 1, f.length - 3)}))
    })
  }

const configRouter = express.Router()

configRouter.get('/chains', handler('chains', componentManifest))
configRouter.get('/features', handler('features', componentManifest))
configRouter.get('/layouts', handler('layouts', componentManifest))
configRouter.get('/output-types', handler('output-types', outputTypeManifest))

configRouter.get('/content/sources', (req, res, next) => {
  Promise.all([
    JGE.find()
      .then(sources => Object.assign(...sources.map(s => ({[s._id]: s})))),
    glob('**/*', {cwd: sourcesRoot})
      .then(sources => Object.assign(...sources.map(s => {
        const id = path.parse(s).name
        return {[id]: id}
      })))
  ])
    .then(([jgeSources, bundleSources]) => Object.assign({}, jgeSources, bundleSources))
    .then(sources => res.send({sources}))
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

'use strict'

const express = require('express')

const {
  bundleSrcRoot,
  deploymentMatcher,
  deploymentWrapper
} = require('../../environment')

const resourcesRouter = express.Router()

const staticHandler = express.static(`${bundleSrcRoot}/resources`)

resourcesRouter.use((req, res, next) => {
  if (deploymentMatcher(req)) {
    staticHandler(req, res, next)
  } else {
    res.redirect(deploymentWrapper(req.originalUrl))
  }
})

module.exports = resourcesRouter

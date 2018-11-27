'use strict'

const path = require('path')

const express = require('express')

const { bundleRoot, deployment } = require('../../environment')

function deploymentSpecificStaticHandler (dir) {
  const useStatic = express.static(dir)
  return (req, res, next) => {
    if (deployment.test(req.originalUrl)) {
      useStatic(req, res, next)
    } else {
      res.redirect(deployment(req.originalUrl))
    }
  }
}

const resourcesRouter = express.Router()

resourcesRouter.use(deploymentSpecificStaticHandler(path.resolve(bundleRoot, 'resources')))

module.exports = resourcesRouter

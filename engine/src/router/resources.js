'use strict'

const path = require('path')

// const bodyParser = require('body-parser')
const express = require('express')

// const classicToFusion = require('../utils/classic-to-fusion')

module.exports = (env) => {
  const { bundleRoot, deployment } = env

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

  const distRouter = express.Router()

  distRouter.use(deploymentSpecificStaticHandler(path.resolve(bundleRoot, 'resources')))

  return distRouter
}

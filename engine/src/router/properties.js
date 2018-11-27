'use strict'

const express = require('express')

const { getProperties } = require('../properties')

const propertiesRouter = express.Router()

propertiesRouter.get(
  ['/', '/:site'],
  (req, res, next) => {
    const site = req.params.site || req.arcSite

    res.send({ properties: getProperties(site) })
  }
)

module.exports = propertiesRouter

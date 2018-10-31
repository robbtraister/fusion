'use strict'

const express = require('express')

const getProperties = require('fusion:properties')

const propertiesRouter = express.Router()

propertiesRouter.get(
  ['/', '/:site'],
  (req, res, next) => {
    const site = req.params.site || req.query._website

    res.send({ properties: getProperties(site) })
  }
)

module.exports = propertiesRouter

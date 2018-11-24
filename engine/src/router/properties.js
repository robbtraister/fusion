'use strict'

const express = require('express')

module.exports = ({ getProperties }) => {
  const propertiesRouter = express.Router()

  propertiesRouter.get(
    ['/', '/:site'],
    (req, res, next) => {
      const site = req.params.site || req.arcSite

      res.send({ properties: getProperties(site) })
    }
  )

  return propertiesRouter
}

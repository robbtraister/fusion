'use strict'

const express = require('express')

const compile = require('../compile')
const getTree = require('../resolve/tree')

const { distRoot } = require('../../../env')

function distRouter (options) {
  const distRouter = express.Router()

  distRouter.get('*', express.static(distRoot, { fallthrough: true }))
  distRouter.get('/templates/:template.js', async (req, res, next) => {
    try {
      const template = req.params.template
      const { js } = await compile({
        template,
        tree: await getTree(template)
      })
      res.send(js)
    } catch (err) {
      next(err)
    }
  })
  distRouter.get('*', (req, res, next) => { res.sendStatus(404) })
  distRouter.use((req, res, next) => { res.sendStatus(405) })

  return distRouter
}

module.exports = distRouter

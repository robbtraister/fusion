'use strict'

const express = require('express')
const request = require('request-promise-native')

const resolve = require('../resolve')

const serveRouter = express.Router()

serveRouter.get('*', (req, res, next) => {
  resolve(req.url)
    .then(data => request.post({
      uri: `http://engine-server:8082/render/template/${data.template}`,
      json: data
    }))
    .then(data => { res.send(data) })
    .catch(next)
})

module.exports = serveRouter

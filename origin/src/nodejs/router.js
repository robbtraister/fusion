'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const lambdaProxy = require('./lambda')

const router = express.Router()

router.all('/status/:code', (req, res, next) => {
  res.sendStatus(req.params.code)
})

// Add parsers
router.use(bodyParser.raw({ type: '*/*' }))
router.use(cookieParser())

// Add lambda proxy
router.use(lambdaProxy.invoke())

module.exports = router

'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const lambdaProxy = require('./lambda')

const router = express.Router()

// Add parsers
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(cookieParser())

// Add lambda proxy
router.use(lambdaProxy.invoke())

module.exports = router

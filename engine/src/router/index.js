'use strict'

const express = require('express')

const router = express.Router()

router.use('/compile', require('./compile'))
router.use('/content', require('./content'))
router.use('/render', require('./render'))
router.use('/resources', [
  express.static(`${__dirname}/../../bundle/resources`),
  express.static(`${__dirname}/../../resources`)
])
router.use('/scripts', require('./scripts'))

module.exports = router

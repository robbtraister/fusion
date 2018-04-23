'use strict'

const express = require('express')

const router = express.Router()

router.use('/content', require('./content'))
router.use('/dist', require('./dist'))
router.use('/render', require('./render'))
router.use('/resources', express.static(`${__dirname}/../../bundle/resources`))

module.exports = router

'use strict'

const express = require('express')

const router = express.Router()

router.use('/resolve', require('./resolve'))
router.use('/serve', require('./serve'))

module.exports = router
